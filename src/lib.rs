pub mod handlers;
pub mod models;
pub mod repositories;
pub mod routes;

#[derive(PartialEq, Debug, Copy, Clone)]
pub enum OpenSignups {
    Disabled,
    Enabled,
}

pub struct Arcadia {
    pub pool: sqlx::PgPool,
    pub open_signups: OpenSignups,
}

impl Arcadia {
    #[inline]
    pub fn is_open_signups(&self) -> bool {
        self.open_signups == OpenSignups::Enabled
    }
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("database error: {0}")]
    GenericDatabaseError(#[from] sqlx::Error),

    #[error("could not create artist")]
    CouldNotCreateArtist(#[source] sqlx::Error),

    #[error("could not create artist affiliation")]
    CouldNotCreateArtistAffiliation(#[source] sqlx::Error),

    #[error("could not create user")]
    CouldNotCreateUser(#[source] sqlx::Error),

    #[error("could not create edition group")]
    CouldNotCreateEditionGroup(#[source] sqlx::Error),

    #[error("could not create invitation")]
    CouldNotCreateInvitation(#[source] sqlx::Error),

    #[error("could not create master group")]
    CouldNotCreateMasterGroup(#[source] sqlx::Error),

    #[error("could not create notification")]
    CouldNotCreateNotification(#[source] sqlx::Error),

    #[error("could not create title group subscription")]
    CouldNotCreateTitleGroupSubscription(#[source] sqlx::Error),

    #[error("could not create title group subscription")]
    CouldNotCreateTitleGroupComment(#[source] sqlx::Error),

    #[error("could not create title group")]
    CouldNotCreateTitleGroup(#[source] sqlx::Error),

    #[error("could not create torrent")]
    CouldNotCreateTorrent(#[source] sqlx::Error),

    #[error("could not create torrent request")]
    CouldNotCreateTorrentRequest(#[source] sqlx::Error),

    #[error("could not create torrent request vote")]
    CouldNotCreateTorrentRequestVote(#[source] sqlx::Error),

    #[error("could not create series")]
    CouldNotCreateSeries(#[source] sqlx::Error),

    #[error("series with id '{0}' not found")]
    SeriesWithIdNotFound(i64),

    #[error("invalid invitation key")]
    InvitationKeyInvalid,

    #[error("invitation key required")]
    InvitationKeyRequired,

    #[error("invitation key already used")]
    InvitationKeyAlreadyUsed,

    #[error("no invitations available")]
    NoInvitationsAvailable,

    #[error("user '{0}' not found")]
    UserNotFound(String),

    #[error("user with id '{0}' not found")]
    UserWithIdNotFound(i64),

    #[error("wrong username or password")]
    WrongUsernameOrPassword,

    #[error("unsupported notification type '{0}'")]
    UnsupportedNotification(String),

    #[error("unsupported subscription type '{0}'")]
    UnsupportedSubscription(String),

    #[error("not enough bonus points to place this bounty")]
    InsufficientBonusPointsForBounty,

    #[error("not enough upload to place this bounty")]
    InsufficientUploadForBounty,

    #[error("unexpected third party response")]
    UnexpectedThirdPartyResponse(#[from] reqwest::Error),
}

pub type Result<T> = std::result::Result<T, Error>;

impl actix_web::ResponseError for Error {
    #[inline]
    fn status_code(&self) -> actix_web::http::StatusCode {
        actix_web::http::StatusCode::INTERNAL_SERVER_ERROR
    }

    fn error_response(&self) -> actix_web::HttpResponse {
        actix_web::HttpResponse::build(self.status_code()).json(serde_json::json!({
            "error": format!("{self}"),
        }))
    }
}
