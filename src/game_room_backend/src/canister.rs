use candid::{decode_one, encode_one, CandidType};
use ic_cdk::{api::time, print};
use ic_cdk_macros::{init, query, update};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use lazy_static::lazy_static;
use ic_cdk::storage;

use ic_websocket_cdk::{
    send, ClientPrincipal, OnCloseCallbackArgs, OnMessageCallbackArgs, OnOpenCallbackArgs,
};

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct AppMessage {
    pub message_type: String,
    pub content: AppContent,
    pub timestamp: u64,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub enum AppContent {
    Join {
        roomId: String,
        user_id: String,
        ready: bool,
    },
    Leave {
        roomId: String,
        user_id: String,
    },
    Character {
        character_name: String,
        abilitys: Vec<AbilityType>,
        character_class: String,
        character_race: String,
        user_id: String,
        character_id: i32,
        ready: bool,
    },
    UserList {
        users: Vec<UserStatus>,
    },
    Dont {
        message: String,
    },
    Chat {
        message: String,
        color: String,
        name: String,
    },
    Offer {
        user_id: String,
        target_id: String,
        sdp: String,
    },
    Answer {
        user_id: String,
        target_id: String,
        sdp: String,
    },
    IceCandidate {
        user_id: String,
        target_id: String,
        candidate: String,
    },
    Play {
        music: String
    },
    Stop {
        message: String
    },
    DmNote {
        message: String
    },
    Background {
        message: String
    }
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct AbilityType {
    key: String,
    value: i32,
}

#[derive(CandidType, Clone, Debug, Deserialize, Serialize, Eq, PartialEq)]
pub struct UserStatus {
    pub user_id: String,
    pub ready: bool,
    pub client_principal: ClientPrincipal,
}

#[derive(CandidType, Clone, Debug, Deserialize, Serialize, Eq, PartialEq)]
pub struct RoomStatus {
    pub room_id: String,
    pub users: HashMap<String, UserStatus>,
}

lazy_static! {
    pub static ref ROOMS: Mutex<HashMap<String, RoomStatus>> = Mutex::new(HashMap::new());
}

pub fn websocket_pre_upgrade() {
    let rooms = ROOMS.lock().unwrap();
    storage::stable_save((rooms.clone(),)).expect("Failed to save ROOMS to stable memory");
}

pub fn websocket_post_upgrade() {
    match storage::stable_restore::<(HashMap<String, RoomStatus>,)>() {
        Ok((stored_rooms,)) => {
            let mut rooms = ROOMS.lock().unwrap();
            *rooms = stored_rooms;
        },
        Err(e) => {
            let mut rooms = ROOMS.lock().unwrap();
            *rooms = HashMap::new(); // Eğer geri yükleme başarısız olursa boş olarak başlat
            ic_cdk::println!("Failed to restore ROOMS from stable memory: {:?}", e);
            ic_cdk::println!("ROOMS initialized with empty data");
        }
    }
}

impl AppMessage {
    fn candid_serialize(&self) -> Vec<u8> {
        encode_one(&self).unwrap()
    }
}

pub fn on_message(args: OnMessageCallbackArgs) {
    let app_msg_result: Result<AppMessage, _> = decode_one(&args.message);

    match app_msg_result {
        Ok(app_msg) => {
            print(format!("Received message: {:?}", app_msg));

            match app_msg.message_type.as_str() {
                "join" => {
                    if let AppContent::Join { roomId, user_id, ready } = app_msg.content {
                        let mut rooms = ROOMS.lock().unwrap();
                        let room_status = rooms.entry(roomId.clone()).or_insert_with(|| RoomStatus {
                            room_id: roomId.clone(),
                            users: HashMap::new(),
                        });

                        room_status.users.insert(
                            user_id.clone(),
                            UserStatus {
                                user_id: user_id.clone(),
                                ready,
                                client_principal: args.client_principal,
                            },
                        );

                        print(format!("User {} joined room {} with ready status {}", user_id, roomId, ready));

                        let user_list: Vec<UserStatus> = room_status.users.values().cloned().collect();
                        let user_list_message = AppMessage {
                            message_type: String::from("user_list"),
                            content: AppContent::UserList { users: user_list },
                            timestamp: time(),
                        };

                        // Kendisine gönder
                        send_app_message(args.client_principal, user_list_message.clone());

                        // Aynı odadaki herkese gönder
                        for (_, user_status) in &room_status.users {
                            send_app_message(user_status.client_principal, user_list_message.clone());
                        }
                    }
                }
                "leave" => {
                    if let AppContent::Leave { roomId, user_id } = app_msg.content {
                        let mut rooms = ROOMS.lock().unwrap();

                        if let Some(room_status) = rooms.get_mut(&roomId) {
                            if let Some(_user_status) = room_status.users.remove(&user_id) {
                                print(format!("User {} left room {}", user_id, roomId));

                                let user_list: Vec<UserStatus> = room_status.users.values().cloned().collect();
                                let user_list_message = AppMessage {
                                    message_type: String::from("user_list"),
                                    content: AppContent::UserList { users: user_list },
                                    timestamp: time(),
                                };

                                for (_, user_status) in &room_status.users {
                                    send_app_message(user_status.client_principal, user_list_message.clone());
                                }
                            }
                        }
                    }
                }
                
                "DONT_PANIC!" => {
                    let mut rooms = ROOMS.lock().unwrap();

                    let mut room_id_opt: Option<String> = None;

                    // Kullanıcının hangi odada olduğunu bul
                    for (room_id, room_status) in rooms.iter() {
                        if room_status.users.values().any(|user| user.client_principal == args.client_principal) {
                            room_id_opt = Some(room_id.clone());
                            break;
                        }
                    }

                    if let Some(room_id) = room_id_opt {
                        if let Some(room_status) = rooms.get(&room_id) {
                            // Gelen DONT_PANIC! mesajını olduğu gibi odadaki tüm kullanıcılara gönder
                            for (_, user_status) in &room_status.users {
                                send_app_message(user_status.client_principal.clone(), app_msg.clone());
                            }
                        }
                    } else {
                        print("User's room not found.");
                    }
                }

                "choose_character" => {
                    if let AppContent::Character {
                        character_name,
                        abilitys,
                        character_class,
                        character_race,
                        character_id,
                        user_id,
                        ready
                    } = app_msg.content
                    {
                        print(format!("Mesaj geldi - Name: {} ", character_name,));

                        let mut room_id_opt: Option<String> = None;
                        let mut user_id_opt: Option<String> = None;

                        // İlk kilitleme
                        {
                            let rooms = ROOMS.lock().unwrap();

                            for (room_id, room_status) in rooms.iter() {
                                if let Some((found_user_id, user_status)) =
                                    room_status.users.iter()
                                    .find(|(_, user)| user.client_principal == args.client_principal)
                                {
                                    room_id_opt = Some(room_id.clone());
                                    user_id_opt = Some(found_user_id.clone());
                                    break;
                                }
                            }
                        }
                        if let Some(room_id) = room_id_opt {
                            if let Some(found_user_id) = user_id_opt {
                                let mut rooms = ROOMS.lock().unwrap();

                                if let Some(room_status) = rooms.get_mut(&room_id) {
                                    print(format!(
                                        "User {} chose character {} in room {}",
                                        found_user_id, character_name, room_id
                                    ));

                                    let character_message = AppMessage {
                                        message_type: String::from("character_chosen"),
                                        content: AppContent::Character {
                                            character_name: character_name.clone(),
                                            abilitys: abilitys.clone(),
                                            character_class: character_class.clone(),
                                            character_race: character_race.clone(),
                                            character_id: character_id,
                                            user_id: found_user_id.clone(),
                                            ready,
                                        },
                                        timestamp: time(),
                                    };

                                    for (_, user_status) in &room_status.users {
                                        send_app_message(user_status.client_principal, character_message.clone());
                                    }
                                }
                            }
                        } else {
                            print("User's room not found.");
                        }
                    }
                }


                

                
                // -- BURADAN İTİBAREN WebRTC MESAJLARI --
                
                "offer" => {
                    if let AppContent::Offer { user_id, target_id, sdp } = app_msg.content {
                        print(format!("📥 Offer alındı: from {} to {}", user_id, target_id));

                        let rooms = ROOMS.lock().unwrap();
                        let mut room_id_opt: Option<String> = None;

                        // Kullanıcının hangi odada olduğunu bul
                        for (room_id, room_status) in rooms.iter() {
                            if room_status.users.contains_key(&user_id) {
                                room_id_opt = Some(room_id.clone());
                                break;
                            }
                        }

                        if let Some(room_id) = room_id_opt {
                            if let Some(room_status) = rooms.get(&room_id) {
                                if let Some(target_user_status) = room_status.users.get(&target_id) {
                                    print(format!("🚀 Offer gönderiliyor: {} -> {} (Room: {})", user_id, target_id, room_id));

                                    let message = AppMessage {
                                        message_type: "offer".to_string(),
                                        content: AppContent::Offer {
                                            user_id: user_id.clone(),
                                            target_id: target_id.clone(),
                                            sdp: sdp.clone(),
                                        },
                                        timestamp: time(),
                                    };

                                    send_app_message(target_user_status.client_principal.clone(), message);
                                } else {
                                    print(format!("⚠️ Target user {} not found in room {}", target_id, room_id));
                                }
                            }
                        } else {
                            print(format!("⚠️ User {} is not associated with any room", user_id));
                        }
                    } else {
                        print("⚠️ Invalid Offer structure");
                    }
                }

                "answer" => {
                    if let AppContent::Answer { user_id, target_id, sdp } = app_msg.content {
                        print(format!("📥 Answer alındı: from {} to {}", user_id, target_id));

                        let rooms = ROOMS.lock().unwrap();
                        let mut room_id_opt: Option<String> = None;

                        // Kullanıcının hangi odada olduğunu bul
                        for (room_id, room_status) in rooms.iter() {
                            if room_status.users.contains_key(&user_id) {
                                room_id_opt = Some(room_id.clone());
                                break;
                            }
                        }

                        if let Some(room_id) = room_id_opt {
                            if let Some(room_status) = rooms.get(&room_id) {
                                if let Some(target_user_status) = room_status.users.get(&target_id) {
                                    print(format!("🚀 Answer gönderiliyor: {} -> {} (Room: {})", user_id, target_id, room_id));

                                    let message = AppMessage {
                                        message_type: "answer".to_string(),
                                        content: AppContent::Answer {
                                            user_id: user_id.clone(),
                                            target_id: target_id.clone(),
                                            sdp: sdp.clone(),
                                        },
                                        timestamp: time(),
                                    };

                                    send_app_message(target_user_status.client_principal.clone(), message);
                                } else {
                                    print(format!("⚠️ Target user {} not found in room {}", target_id, room_id));
                                }
                            }
                        } else {
                            print(format!("⚠️ User {} is not associated with any room", user_id));
                        }
                    } else {
                        print("⚠️ Invalid Answer structure");
                    }
                }

                "ice-candidate" => {
                    if let AppContent::IceCandidate { user_id, target_id, candidate } = app_msg.content {
                        print(format!("📥 ICE Candidate alındı: from {} to {}", user_id, target_id));

                        let rooms = ROOMS.lock().unwrap();
                        let mut room_id_opt: Option<String> = None;

                        // Kullanıcının hangi odada olduğunu bul
                        for (room_id, room_status) in rooms.iter() {
                            if room_status.users.contains_key(&user_id) {
                                room_id_opt = Some(room_id.clone());
                                break;
                            }
                        }

                        if let Some(room_id) = room_id_opt {
                            if let Some(room_status) = rooms.get(&room_id) {
                                if let Some(target_user_status) = room_status.users.get(&target_id) {
                                    print(format!("🚀 ICE Candidate gönderiliyor: {} -> {} (Room: {})", user_id, target_user_status.client_principal.clone(), room_id));

                                    let message = AppMessage {
                                        message_type: "ice-candidate".to_string(),
                                        content: AppContent::IceCandidate {
                                            user_id: user_id.clone(),
                                            target_id: target_id.clone(),
                                            candidate: candidate.clone(),
                                        },
                                        timestamp: time(),
                                    };

                                    send_app_message(target_user_status.client_principal.clone(), message);
                                } else {
                                    print(format!("⚠️ Target user {} not found in room {}", target_id, room_id));
                                }
                            }
                        } else {
                            print(format!("⚠️ User {} is not associated with any room", user_id));
                        }
                    } else {
                        print("⚠️ Invalid ICE Candidate structure");
                    }
                }



                // -- WebRTC MESAJLARI BİTTİ --


                "Chat" => {
                    let mut rooms = ROOMS.lock().unwrap();

                    let mut room_id_opt: Option<String> = None;

                    // Kullanıcının hangi odada olduğunu bul
                    for (room_id, room_status) in rooms.iter() {
                        if room_status.users.values().any(|user| user.client_principal == args.client_principal) {
                            room_id_opt = Some(room_id.clone());
                            break;
                        }
                    }

                    if let Some(room_id) = room_id_opt {
                        if let Some(room_status) = rooms.get(&room_id) {
                            // Gelen DONT_PANIC! mesajını olduğu gibi odadaki tüm kullanıcılara gönder
                            for (_, user_status) in &room_status.users {
                                send_app_message(user_status.client_principal.clone(), app_msg.clone());
                            }
                        }
                    } else {
                        print("User's room not found.");
                    }
                }

                "Background" => {
                    let mut rooms = ROOMS.lock().unwrap();

                    let mut room_id_opt: Option<String> = None;

                    // Kullanıcının hangi odada olduğunu bul
                    for (room_id, room_status) in rooms.iter() {
                        if room_status.users.values().any(|user| user.client_principal == args.client_principal) {
                            room_id_opt = Some(room_id.clone());
                            break;
                        }
                    }

                    if let Some(room_id) = room_id_opt {
                        if let Some(room_status) = rooms.get(&room_id) {
                            // Gelen DONT_PANIC! mesajını olduğu gibi odadaki tüm kullanıcılara gönder
                            for (_, user_status) in &room_status.users {
                                send_app_message(user_status.client_principal.clone(), app_msg.clone());
                            }
                        }
                    } else {
                        print("User's room not found.");
                    }
                }

                "DmNote" => {
                    let mut rooms = ROOMS.lock().unwrap();

                    let mut room_id_opt: Option<String> = None;

                    // Kullanıcının hangi odada olduğunu bul
                    for (room_id, room_status) in rooms.iter() {
                        if room_status.users.values().any(|user| user.client_principal == args.client_principal) {
                            room_id_opt = Some(room_id.clone());
                            break;
                        }
                    }

                    if let Some(room_id) = room_id_opt {
                        if let Some(room_status) = rooms.get(&room_id) {
                            // Gelen DONT_PANIC! mesajını olduğu gibi odadaki tüm kullanıcılara gönder
                            for (_, user_status) in &room_status.users {
                                send_app_message(user_status.client_principal.clone(), app_msg.clone());
                            }
                        }
                    } else {
                        print("User's room not found.");
                    }
                }
                
                "Play" => {
                    let mut rooms = ROOMS.lock().unwrap();

                    let mut room_id_opt: Option<String> = None;

                    // Kullanıcının hangi odada olduğunu bul
                    for (room_id, room_status) in rooms.iter() {
                        if room_status.users.values().any(|user| user.client_principal == args.client_principal) {
                            room_id_opt = Some(room_id.clone());
                            break;
                        }
                    }

                    if let Some(room_id) = room_id_opt {
                        if let Some(room_status) = rooms.get(&room_id) {
                            // Gelen DONT_PANIC! mesajını olduğu gibi odadaki tüm kullanıcılara gönder
                            for (_, user_status) in &room_status.users {
                                send_app_message(user_status.client_principal.clone(), app_msg.clone());
                            }
                        }
                    } else {
                        print("User's room not found.");
                    }
                }

                "Stop" => {
                    let mut rooms = ROOMS.lock().unwrap();

                    let mut room_id_opt: Option<String> = None;

                    // Kullanıcının hangi odada olduğunu bul
                    for (room_id, room_status) in rooms.iter() {
                        if room_status.users.values().any(|user| user.client_principal == args.client_principal) {
                            room_id_opt = Some(room_id.clone());
                            break;
                        }
                    }

                    if let Some(room_id) = room_id_opt {
                        if let Some(room_status) = rooms.get(&room_id) {
                            // Gelen DONT_PANIC! mesajını olduğu gibi odadaki tüm kullanıcılara gönder
                            for (_, user_status) in &room_status.users {
                                send_app_message(user_status.client_principal.clone(), app_msg.clone());
                            }
                        }
                    } else {
                        print("User's room not found.");
                    }
                }


                _ => {
                    print(format!("Unknown message type: {}", app_msg.message_type));
                }
            }
        },
        Err(e) => {
            print(format!("Failed to decode message: {}", e));
        }
    }
}

/// Artık send_webrtc_message fonksiyonuna ihtiyacımız yok.
/// Bütün gönderme işlemleri `send_app_message` fonksiyonu üzerinden ilerliyor.

fn send_app_message(client_principal: ClientPrincipal, msg: AppMessage) {
    print(format!("Sending message: {:?}", msg));

    if let Err(e) = send(client_principal, msg.candid_serialize()) {
        println!("Could not send message: {}", e);
    }
}


pub fn on_open(args: OnOpenCallbackArgs) {
    print("WebSocket connection opened");
}



pub fn on_close(args: OnCloseCallbackArgs) {
    // let mut rooms = ROOMS.lock().unwrap();
    // let mut user_removed = false;

    // for (room_id, room) in rooms.iter_mut() {
    //     let users_before = room.users.len();
    //     room.users.retain(|_, user| user.client_principal != args.client_principal);
    //     let users_after = room.users.len();

    //     if users_before != users_after {
    //         print(format!(
    //             "🧹 Client {} disconnected and removed from room {}",
    //             args.client_principal, room_id
    //         ));
    //         user_removed = true;
    //         break; // Kullanıcı bir odadan kaldırıldıysa döngüyü sonlandır
    //     }
    // }

    // if !user_removed {
    //     print(format!(
    //         "⚠️ Client {} disconnected but was not found in any room.",
    //         args.client_principal
    //     ));
    // }
}



