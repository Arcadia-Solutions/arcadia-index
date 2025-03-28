use crate::{
    models::{torrent_request_vote::UserCreatedTorrentRequestVote, user::User},
    repositories::torrent_request_vote_repository::create_torrent_request_vote,
};
use actix_web::{HttpResponse, web};
use sqlx::PgPool;

pub async fn add_torrent_request_vote(
    torrent_request_vote: web::Json<UserCreatedTorrentRequestVote>,
    pool: web::Data<PgPool>,
    current_user: User,
) -> HttpResponse {
    match create_torrent_request_vote(&pool, &torrent_request_vote, &current_user).await {
        Ok(created_artist) => HttpResponse::Created().json(serde_json::json!(created_artist)),
        Err(err) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": err.to_string()
        })),
    }
}
