use crate::models::{
    master_group::{MasterGroup, UserCreatedMasterGroup},
    user::User,
};
use actix_web::web;
use sqlx::PgPool;
use std::error::Error;

pub async fn create_master_group(
    pool: &web::Data<PgPool>,
    master_group_form: &UserCreatedMasterGroup,
    current_user: &User,
) -> Result<MasterGroup, Box<dyn Error>> {
    let create_master_group_query = r#"
        INSERT INTO master_groups (name,created_by_id) 
        VALUES ($1, $2)
        RETURNING *;
    "#;

    let created_master_group = sqlx::query_as::<_, MasterGroup>(create_master_group_query)
        .bind(&master_group_form.name)
        // .bind(&master_group_form.name_aliases)
        .bind(&current_user.id)
        // .bind(&master_group_form.description)
        // .bind(&master_group_form.original_language)
        // .bind(&master_group_form.country_from)
        // .bind(&master_group_form.covers)
        // .bind(&master_group_form.banners)
        // .bind(&master_group_form.fan_arts)
        // .bind(&master_group_form.category)
        // .bind(&master_group_form.tags)
        .fetch_one(pool.get_ref())
        .await;

    match created_master_group {
        Ok(_) => Ok(created_master_group.unwrap()),
        Err(e) => {
            println!("{:#?}", e);
            match e {
                sqlx::Error::Database(db_error) => db_error.message().to_string(),
                _ => e.to_string(),
            };
            Err(format!("could not create master group").into())
        }
    }
}
