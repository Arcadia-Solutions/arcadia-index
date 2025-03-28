use std::collections::HashMap;

use crate::{
    models::{artist::UserCreatedArtist, title_group::UserCreatedAffiliatedArtist, user::User},
    repositories::artist_repository::{
        create_artist, create_artists_affiliation, find_artist_publications,
    },
};
use actix_web::{HttpResponse, web};
use sqlx::PgPool;

pub async fn add_artist(
    artist: web::Json<UserCreatedArtist>,
    pool: web::Data<PgPool>,
    current_user: User,
) -> HttpResponse {
    match create_artist(&pool, &artist, &current_user).await {
        Ok(created_artist) => HttpResponse::Created().json(serde_json::json!(created_artist)),
        Err(err) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": err.to_string()
        })),
    }
}

pub async fn add_affiliated_artists(
    artists: web::Json<Vec<UserCreatedAffiliatedArtist>>,
    pool: web::Data<PgPool>,
    current_user: User,
) -> HttpResponse {
    match create_artists_affiliation(&pool, &artists, &current_user).await {
        Ok(created_affiliations) => {
            HttpResponse::Created().json(serde_json::json!(created_affiliations))
        }
        Err(err) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": err.to_string()
        })),
    }
}

pub async fn get_artist_publications(
    query: web::Query<HashMap<String, String>>,
    pool: web::Data<PgPool>,
) -> HttpResponse {
    let artist_id = query.get("id").expect("id not found in query");
    match find_artist_publications(&pool, &artist_id.parse::<i32>().unwrap()).await {
        Ok(artist_publications) => {
            HttpResponse::Created().json(serde_json::json!(artist_publications))
        }
        Err(err) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": err.to_string()
        })),
    }
}
