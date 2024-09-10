
use candid::types::principal;
use candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::{init,query, update};
use std::collections::HashMap;
use std::sync::Mutex;
use lazy_static::lazy_static;
use canister::{websocket_post_upgrade, websocket_pre_upgrade, ROOMS};
use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod, HttpResponse,
};

use ic_cdk_macros::*;

use canister::{on_close, on_message, on_open, AppMessage};
use ic_websocket_cdk::{
    CanisterWsCloseArguments, CanisterWsCloseResult, CanisterWsGetMessagesArguments,
    CanisterWsGetMessagesResult, CanisterWsMessageArguments, CanisterWsMessageResult,
    CanisterWsOpenArguments, CanisterWsOpenResult, WsHandlers, WsInitParams,
};

mod canister;


use png::Decoder as PngDecoder;
use jpeg_decoder::Decoder as JpegDecoder;
use jpeg_encoder::{Encoder as JpegEncoder, ColorType};
use resize::Pixel::RGB8;
use resize::Type::Lanczos3;
use std::io::Cursor;

fn decode_and_resize_image(image_data: Vec<u8>) -> Result<Vec<u8>, String> {
    if image_data.starts_with(&[0xFF, 0xD8]) {
        // JPEG dosyası ise
        decode_and_resize_jpeg(image_data)
    } else if image_data.starts_with(&[0x89, b'P', b'N', b'G']) {
        // PNG dosyası ise
        decode_and_resize_png(image_data)
    } else {
        Err("Unsupported image format".to_string())
    }
}

fn decode_and_resize_jpeg(image_data: Vec<u8>) -> Result<Vec<u8>, String> {
    let mut decoder = JpegDecoder::new(Cursor::new(image_data));
    let decoded_image = decoder.decode().map_err(|e| format!("Failed to decode JPEG: {}", e))?;
    let metadata = decoder.info().ok_or("Failed to get JPEG metadata")?;
    resize_image(decoded_image, metadata.width.into(), metadata.height.into())
}

fn decode_and_resize_png(image_data: Vec<u8>) -> Result<Vec<u8>, String> {
    let decoder = PngDecoder::new(Cursor::new(image_data));
    let mut reader = decoder.read_info().map_err(|e| format!("Failed to read PNG info: {}", e))?;
    let mut buf = vec![0; reader.output_buffer_size()];
    let info = reader.next_frame(&mut buf).map_err(|e| format!("Failed to decode PNG: {}", e))?;
    let decoded_image = &buf[..info.buffer_size()];
    resize_image(decoded_image.to_vec(), info.width as usize, info.height as usize)
}

fn resize_image(decoded_image: Vec<u8>, width: usize, height: usize) -> Result<Vec<u8>, String> {
    let target_width = 800usize;
    let target_height = (target_width as f32 / width as f32 * height as f32) as usize;

    let mut resizer = resize::new(
        width,
        height,
        target_width,
        target_height,
        RGB8,
        Lanczos3,
    ).map_err(|e| format!("Failed to create resizer: {}", e))?;

    let src_image = decoded_image
        .chunks(3)
        .map(|chunk| resize::px::RGB::new(chunk[0], chunk[1], chunk[2]))
        .collect::<Vec<_>>();
    let mut dst_image = vec![resize::px::RGB::new(0, 0, 0); target_width * target_height];

    resizer.resize(&src_image, &mut dst_image).map_err(|e| format!("Resize failed: {}", e))?;

    let mut buffer = Vec::new();
    let quality = 80;
    let mut jpeg_encoder = JpegEncoder::new(&mut buffer, quality);
    jpeg_encoder
        .encode(
            &dst_image.iter().flat_map(|p| vec![p.r, p.g, p.b]).collect::<Vec<_>>(),
            target_width as u16,
            target_height as u16,
            ColorType::Rgb,
        )
        .map_err(|e| format!("Failed to encode image: {}", e))?;

    Ok(buffer)
}

#[update]
async fn fetch_image_as_vec(url: String) -> Result<Vec<u8>, String> {
    let request_headers = vec![
        HttpHeader {
            name: "Host".to_string(),
            value: "oaidalleapiprodscus.blob.core.windows.net".to_string(),
        },
        HttpHeader {
            name: "User-Agent".to_string(),
            value: "image_fetcher_canister".to_string(),
        },
    ];

    let request = CanisterHttpRequestArgument {
        url: url.clone(),
        method: HttpMethod::GET,
        body: None,
        max_response_bytes: Some(2_000_000),
        transform: None,
        headers: request_headers,
    };

    let cycles = 530_949_972_000;
    match http_request(request, cycles).await {
        Ok((HttpResponse { body, .. },)) => {
            match decode_and_resize_image(body) {
                Ok(compressed_image) => Ok(compressed_image),
                Err(e) => Err(format!("Image processing failed: {}", e)),
            }
        }
        Err((r, m)) => Err(format!(
            "HTTP Request failed. RejectionCode: {:?}, Error: {}",
            r, m
        )),
    }
}

#[update]
async fn save_character(
    name: String,
    race: String,
    classes: String,
    abilitys: Ability,
    url: String,
    level: Option<i32>,
) {
    let caller = ic_cdk::caller().to_string();
    let mut users = USERS.lock().unwrap();

    ic_cdk::println!("Save character");

    if let Some(user) = users.profile.get_mut(&caller) {
        let next_id: i32 = user.characters.len() as i32;

        match fetch_image_as_vec(url).await {
            Ok(image_data) => {
                let new_character = Character {
                    id: next_id.clone(),
                    avatar: Some(image_data),
                    name,
                    race,
                    classes,
                    abilitys,
                    level: level.or(Some(1)),
                };

                user.characters.push(new_character);
                ic_cdk::println!("Character with ID {} added to user {}", next_id, caller);
            }
            Err(error) => {
                ic_cdk::println!("Failed to fetch image for user ID {}: {}", caller, error);
            }
        }
    } else {
        ic_cdk::println!("User with ID {} not found", caller);
    }
}



#[update]
async fn add_image(image_url: String) {
    // Kullanıcıyı güncelleme fonksiyonu
    let caller_id = ic_cdk::caller().to_string(); // Kullanıcı ID'sini ic_cdk::caller() ile alın

    let mut users = USERS.lock().unwrap();

    if let Some(user) = users.profile.get_mut(&caller_id) {
        match fetch_image_as_vec(image_url).await {
            Ok(image_data) => {
                user.images.push(image_data); // Resmi kullanıcının resim dizisine ekleyin
                ic_cdk::println!("Image added successfully for user ID {}", caller_id);
            }
            Err(error) => {
                ic_cdk::println!("Failed to fetch image for user ID {}: {}", caller_id, error);
            }
        }
    } else {
        ic_cdk::println!("User with ID {} not found", caller_id);
    }
}
///////// Type Definitation ////////////////////////////
#[derive(Debug, CandidType, Deserialize, Clone)]
struct Ability {
    strength: i32,
    dexterity: i32,
    constitution: i32,
    intelligence: i32,
    wisdom: i32,
    charisma: i32,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
struct Character {
    id: i32, 
    avatar: Option<Vec<u8>>,
    name: String,
    race: String,
    classes: String,
    abilitys: Ability,
    level: Option<i32>,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
struct PlayerCharacter {
    user_id: String,
    player_id: i32,
    character: Character,
    condition: Option<String>,
    hp: Option<i32>,
    xp: Option<i32>,
    saving: Option<i32>,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
struct GameRoom {
    room_id: String,
    dm_id: String,
    players: Vec<String>,
    characters: Option<Vec<PlayerCharacter>>,
}

impl GameRoom {
    fn new(room_id: String, dm_id: String, players: Vec<String>) -> Self {
        Self { room_id, dm_id, players, characters: None }
    }

    fn add_player_character(&mut self, player_character: PlayerCharacter) {
        match &mut self.characters {
            Some(characters) => characters.push(player_character),
            None => self.characters = Some(vec![player_character]),
        }
    }

    fn list_characters(&self) -> Vec<PlayerCharacter> {
        self.characters.clone().unwrap_or_else(Vec::new)
    }
}


#[derive(CandidType, Deserialize, Default, Clone)]
struct GameRooms {
    rooms: HashMap<String, GameRoom>,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
struct User {
    userId: String,
    userName: String,
    images: Vec<Vec<u8>>,
    characters: Vec<Character>,
}

impl User {
    fn new(userId: String, userName: String) -> Self {
        Self {
            userId,
            userName,
            characters: Vec::new(), // Başlangıçta boş bir karakter dizisi
            images: Vec::new()
        }
    }
}





#[derive(CandidType, Deserialize, Default, Clone)]
struct Users {
    profile: HashMap<String, User>
}

lazy_static! {
    static ref GAME_ROOMS: Mutex<GameRooms> = Mutex::new(GameRooms::default());
    static ref USERS: Mutex<Users> = Mutex::new(Users::default());
}

#[init]
fn init() {
    // lib.rs'deki başlatma işlemleri
    let mut game_rooms = GAME_ROOMS.lock().unwrap();
    game_rooms.rooms = HashMap::new();
    ic_cdk::println!("GameRooms initialized");

    let mut profiles = USERS.lock().unwrap();
    profiles.profile = HashMap::new();

    // canister.rs'deki ROOMS yapısının başlatılması
    let mut rooms = ROOMS.lock().unwrap();
    *rooms = HashMap::new();
    ic_cdk::println!("ROOMS initialized");


    // WebSocket olaylarını yönetecek olan handler'ları tanımla
    let handlers = WsHandlers {
        on_open: Some(on_open),
        on_message: Some(on_message),
        on_close: Some(on_close),
    };

    // WebSocket işlemlerini başlat
    let params = WsInitParams::new(handlers);
    ic_websocket_cdk::init(params);
}



////////////// User Proces //////////////////////////////////////////////

#[update]
fn create_user(userid: String){
    let new_user = User::new(userid.clone(), String::new());
    let mut users = USERS.lock().unwrap();
    users.profile.insert(userid.clone(), new_user);
    ic_cdk::println!("Create user");
}

#[query]
fn user_control(userid: String) -> bool {
    let users = USERS.lock().unwrap();
    users.profile.contains_key(&userid)
}

#[query]
fn get_user(userid: String) -> Option<User>{
    let users = USERS.lock().unwrap();
    let user = users.profile.get(&userid).cloned();
    user
}

#[query]
fn get_username(userid: String) -> String {
    let users = USERS.lock().unwrap();
    match users.profile.get(&userid) {
        Some(user) => user.userName.clone(),
        None => format!("User with IDlk {} not found", userid),
    }
}

#[update]
fn update_user(userid: String, username: String) {
    let update_user = User::new(userid.clone(), username);
    let mut users = USERS.lock().unwrap();

    if let Some(user) = users.profile.get_mut(&userid) {
        ic_cdk::println!("Update user");
        *user = update_user;
    } else {
        ic_cdk::println!("User with ID {} not found", userid);
    }
}

///////////////////////////////////////////////////////////////


#[query]
fn count_characters() -> i32 {
    let caller = ic_cdk::caller().to_string();
    let users = USERS.lock().unwrap();

    if let Some(user) = users.profile.get(&caller) {
        user.characters.len() as i32
    } else {
        0 // Kullanıcı bulunamazsa 0 döndür
    }
}



#[query]
fn list_characters() -> Vec<Character> {
    let caller = ic_cdk::caller().to_string();
    let users = USERS.lock().unwrap();
    ic_cdk::println!("List character");
    if let Some(user) = users.profile.get(&caller) {
        user.characters.clone() // Kullanıcının karakterlerini döndürür
    } else {
        Vec::new() // Kullanıcı bulunamazsa boş bir vektör döndürür
    }
}

#[derive(CandidType, Deserialize, Clone)]
struct CharacterInfo {
    id: i32,
    name: String,
}

#[query]
fn list_character_names() -> Vec<CharacterInfo> {
    let caller = ic_cdk::caller().to_string();
    let users = USERS.lock().unwrap();
    ic_cdk::println!("List character names and ids");
    
    if let Some(user) = users.profile.get(&caller) {
        user.characters.iter().map(|character| CharacterInfo {
            id: character.id,
            name: character.name.clone(),
        }).collect() // Kullanıcının karakter isimlerini ve ID'lerini döndürür
    } else {
        Vec::new() // Kullanıcı bulunamazsa boş bir vektör döndürür
    }
}




#[query]
fn get_character_by_id(id: i32) -> Option<Character> {
    let caller = ic_cdk::caller().to_string();
    let users = USERS.lock().unwrap();

    if let Some(user) = users.profile.get(&caller) {
        for character in &user.characters {
            if character.id == id {
                return Some(character.clone());
            }
        }
        None // ID'ye sahip karakter bulunamazsa
    } else {
        None // Kullanıcı bulunamazsa
    }
}


#[query]
fn get_character_by_user_id(id: i32, user_id: String) -> Option<Character> {
    let caller = user_id;
    let users = USERS.lock().unwrap();

    if let Some(user) = users.profile.get(&caller) {
        for character in &user.characters {
            if character.id == id {
                return Some(character.clone());
            }
        }
        None // ID'ye sahip karakter bulunamazsa
    } else {
        None // Kullanıcı bulunamazsa
    }
}

///////////////// Room Process ////////////////////////////////////////

#[update]
fn add_room(room_id: String, dm_id: String, players: Vec<String>) {
    let new_room = GameRoom::new(room_id.clone(), dm_id, players);
    let mut game_rooms = GAME_ROOMS.lock().unwrap();
    game_rooms.rooms.insert(room_id.clone(), new_room);
    ic_cdk::println!("Room added: {}", room_id);
}

#[update]
fn add_room_player_character(player_character: PlayerCharacter, room_id: String) {
    let mut game_rooms = GAME_ROOMS.lock().unwrap();
    if let Some(room) = game_rooms.rooms.get_mut(&room_id) {
        room.add_player_character(player_character);
        ic_cdk::println!("Player character added to room {}", room_id);
    } else {
        ic_cdk::println!("Room with ID {} not found", room_id);
    }
}

#[query]
fn get_room(room_id: String) -> Option<GameRoom> {
    let game_rooms = GAME_ROOMS.lock().unwrap();
    let room = game_rooms.rooms.get(&room_id).cloned();
    ic_cdk::println!("Room requested: {} - Found: {}", room_id, room.is_some());
    room
}

#[update]
fn remove_room(room_id: String) {
    let mut game_rooms = GAME_ROOMS.lock().unwrap();
    game_rooms.rooms.remove(&room_id);
    ic_cdk::println!("Room removed: {}", room_id);
}

#[query]
fn whoami() -> Principal {
    ic_cdk::caller()
}



#[pre_upgrade]
fn pre_upgrade() {
    // Kullanıcı ve Oyun Odası verilerini stabilize edilen belleğe kaydet
    let users = USERS.lock().unwrap();
    let game_rooms = GAME_ROOMS.lock().unwrap();

    // WebSocket'teki ROOMS verisini stabilize edilen belleğe kaydetmek için çağırın
    websocket_pre_upgrade();

    // Verileri stabilize edilen bellekte sakla
    ic_cdk::storage::stable_save((users.clone(), game_rooms.clone())).expect("Failed to save stable memory");
}

#[post_upgrade]
fn post_upgrade() {
    // Stabilize edilen bellekten kullanıcı ve oyun odası verilerini geri yükle
    if let Ok((stored_users, stored_game_rooms)) = ic_cdk::storage::stable_restore::<(Users, GameRooms)>() {
        let mut users = USERS.lock().unwrap();
        let mut game_rooms = GAME_ROOMS.lock().unwrap();
        
        *users = stored_users;
        *game_rooms = stored_game_rooms;

        // WebSocket'teki ROOMS verisini stabilize edilen bellekten geri yüklemek için çağırın
        websocket_post_upgrade();
    } else {
        ic_cdk::println!("Geri yükleme hatası");
        // Eğer geri yükleme başarısız olursa, varsayılanları başlat
    }
}

// method called by the client to open a WS connection to the canister (relayed by the WS Gateway)
#[update]
fn ws_open(args: CanisterWsOpenArguments) -> CanisterWsOpenResult {
    ic_websocket_cdk::ws_open(args)
}

// method called by the Ws Gateway when closing the IcWebSocket connection for a client
#[update]
fn ws_close(args: CanisterWsCloseArguments) -> CanisterWsCloseResult {
    ic_websocket_cdk::ws_close(args)
}

// method called by the client to send a message to the canister (relayed by the WS Gateway)
#[update]
fn ws_message(
    args: CanisterWsMessageArguments,
    msg_type: Option<AppMessage>,
) -> CanisterWsMessageResult {
    ic_websocket_cdk::ws_message(args, msg_type)
}

// method called by the WS Gateway to get messages for all the clients it serves
#[query]
fn ws_get_messages(args: CanisterWsGetMessagesArguments) -> CanisterWsGetMessagesResult {
    ic_websocket_cdk::ws_get_messages(args)
}


