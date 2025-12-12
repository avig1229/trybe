# Appendix B: Database Schema Diagram (ERD)

The following diagram illustrates the relational structure of the Trybe database, highlighting the connections between the core "Project Valley" entities (Projects, Channels, Blocks) and the "Collective Pulse" social layer (Posts, Likes, Comments, Tribes).

```mermaid
erDiagram
    %% Core Users
    PROFILES ||--o{ PROJECTS : "creates"
    PROFILES ||--o{ TRIBES : "founded by"
    PROFILES ||--o{ POSTS : "authors"
    PROFILES ||--o{ COMMENTS : "writes"
    PROFILES ||--o{ LIKES : "gives"
    PROFILES ||--o{ TRIBE_MEMBERSHIPS : "joins"
    PROFILES ||--o{ FOLLOWS : "follows"
    PROFILES ||--o{ FOLLOWS : "is followed by"
    PROFILES ||--o{ PROJECT_SAVES : "saves"
    PROFILES ||--o{ COLLABORATION_REQUESTS : "requests"
    
    PROFILES {
        uuid id PK
        string username
        string full_name
        string avatar_url
        string bio
        string[] skills
        boolean looking_for_collaboration
    }

    %% Project Valley Structure
    PROJECTS ||--o{ CHANNELS : "contains"
    PROJECTS ||--o{ POSTS : "referenced in"
    PROJECTS ||--o{ COLLABORATION_REQUESTS : "receives"
    PROJECTS ||--|{ PROJECT_SAVES : "saved by"
    PROJECTS }o--|| TRIBES : "associated with"

    PROJECTS {
        uuid id PK
        uuid user_id FK
        string name
        string status "active, planning, completed"
        boolean is_public
        string[] tags
        uuid tribe_id FK "optional"
    }

    CHANNELS ||--o{ BLOCKS : "organizes"
    CHANNELS {
        uuid id PK
        uuid project_id FK
        string name
        int order_index
    }

    BLOCKS {
        uuid id PK
        uuid channel_id FK
        string type "text, image, video, link"
        string content
        jsonb metadata
    }

    %% Collective Pulse & Social
    TRIBES ||--o{ TRIBE_MEMBERSHIPS : "has members"
    TRIBES ||--o{ POSTS : "contains context"
    
    TRIBES {
        uuid id PK
        uuid creator_id FK
        string name
        string slug
        boolean is_public
        int member_count
    }

    TRIBE_MEMBERSHIPS {
        uuid tribe_id FK
        uuid user_id FK
        string role
        timestamp joined_at
    }

    POSTS ||--o{ LIKES : "receives"
    POSTS ||--o{ COMMENTS : "has"
    
    POSTS {
        uuid id PK
        uuid user_id FK
        uuid project_id FK
        uuid tribe_id FK
        string type "daily_update, question, showcase"
        string content
        string media_url
        int like_count
    }

    COMMENTS ||--o{ COMMENTS : "replies to"
    COMMENTS {
        uuid id PK
        uuid user_id FK
        uuid post_id FK
        uuid parent_comment_id FK
        string content
    }

    LIKES {
        uuid user_id FK
        uuid post_id FK
        string type
    }

    FOLLOWS {
        uuid follower_id FK
        uuid following_id FK
    }

    COLLABORATION_REQUESTS {
        uuid id PK
        uuid requester_id FK
        uuid project_id FK
        string status
        string message
    }
```
