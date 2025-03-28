use crate::models::user::{PublicUser, User};
use actix_web::web;
use sqlx::PgPool;
use std::error::Error;

pub async fn find_user_by_username(
    pool: &web::Data<PgPool>,
    username: &str,
) -> Result<User, Box<dyn Error>> {
    let query = r#"
        SELECT * FROM users
        WHERE username = $1
    "#;

    let result = sqlx::query_as::<_, User>(query)
        .bind(username)
        .fetch_one(pool.get_ref())
        .await;

    match result {
        Ok(_) => Ok(result.unwrap()),
        Err(e) => {
            match e {
                sqlx::Error::Database(db_error) => db_error.message().to_string(),
                _ => e.to_string(),
            };
            Err(format!("User not found").into())
        }
    }
}
pub async fn find_user_by_id(
    pool: &web::Data<PgPool>,
    id: &i64,
) -> Result<PublicUser, Box<dyn Error>> {
    let query = r#"
        SELECT * FROM users
        WHERE id = $1
    "#;

    let result = sqlx::query_as::<_, PublicUser>(query)
        .bind(id)
        .fetch_one(pool.get_ref())
        .await;

    match result {
        Ok(_) => Ok(result.unwrap()),
        Err(e) => {
            match e {
                sqlx::Error::Database(db_error) => db_error.message().to_string(),
                _ => e.to_string(),
            };
            Err(format!("User not found").into())
        }
    }
}
