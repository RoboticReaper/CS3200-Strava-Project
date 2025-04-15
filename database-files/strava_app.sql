CREATE DATABASE IF NOT EXISTS strava_app;
USE strava_app;


CREATE TABLE IF NOT EXISTS users (
 id INT PRIMARY KEY AUTO_INCREMENT,
 first_name VARCHAR(255) NOT NULL,
 last_name VARCHAR(255) NOT NULL,
 email VARCHAR(255) NOT NULL,
 profile_hidden BOOLEAN NOT NULL DEFAULT 0,
 is_flagged BOOLEAN NOT NULL DEFAULT 0
);


CREATE TABLE IF NOT EXISTS run (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 distance FLOAT NOT NULL,
 duration FLOAT NOT NULL,
 time DATETIME NOT NULL,
 calories FLOAT NOT NULL,
 avg_pace FLOAT NOT NULL,
 suspicious BOOLEAN NOT NULL DEFAULT 0,
 is_flagged BOOLEAN NOT NULL DEFAULT 0,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS coordinates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    run_id INT NOT NULL,
    time DATETIME NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    FOREIGN KEY (run_id) REFERENCES run(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS heart_rate_alerts (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 threshold INT NOT NULL,
 alert_triggered BOOLEAN NOT NULL DEFAULT 0,
 UNIQUE (user_id),
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS leaderboard (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 `rank` INT NOT NULL,
 total_distance FLOAT NOT NULL,
 total_time FLOAT NOT NULL,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS posts (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 title VARCHAR(255) NOT NULL,
 content TEXT NOT NULL,
 post_flair VARCHAR(255) NOT NULL,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS comments (
 id INT PRIMARY KEY AUTO_INCREMENT,
 post_id INT NOT NULL,
 user_id INT NOT NULL,
 content TEXT NOT NULL,
 FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS `groups` (
 id INT PRIMARY KEY AUTO_INCREMENT,
 name VARCHAR(255) NOT NULL UNIQUE,
 description TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS friends (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_one_id INT NOT NULL,
 user_two_id INT NOT NULL,
 status VARCHAR(50) NOT NULL,
 FOREIGN KEY (user_one_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY (user_two_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS weekly_summaries (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 week_start_date DATE NOT NULL,
 total_distance FLOAT NOT NULL,
 total_time FLOAT NOT NULL,
 total_calories FLOAT NOT NULL,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS run_shares (
 id INT PRIMARY KEY AUTO_INCREMENT,
 run_id INT NOT NULL,
 shared_with_email VARCHAR(255) NOT NULL,
 FOREIGN KEY (run_id) REFERENCES run(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS group_membership (
 id INT PRIMARY KEY AUTO_INCREMENT,
 group_id INT NOT NULL,
 user_id INT NOT NULL,
 FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS security_logs (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 action VARCHAR(255) NOT NULL,
 detail TEXT NOT NULL,
 timestamp DATETIME NOT NULL,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


INSERT INTO users (first_name, last_name, email, profile_hidden, is_flagged)
VALUES
 ('John', 'Doe', 'john.doe@example.com', 0, 0),
 ('Jane', 'Smith', 'jane.smith@example.com', 0, 0),
 ('Alice', 'Johnson', 'alice.johnson@example.com', 1, 0);


INSERT INTO run (user_id, distance, duration, time, calories, avg_pace, suspicious, is_flagged)
VALUES
 (1, 5.2, 30.5, '2025-04-10 08:00:00', 300, 6.0, 0, 0),
 (2, 3.1, 20.0, '2025-04-09 07:30:00', 250, 6.5, 0, 0),
 (3, 10.0, 60.0, '2025-04-08 06:45:00', 600, 6.0, 0, 0);


INSERT INTO heart_rate_alerts (user_id, threshold, alert_triggered)
VALUES
 (1, 180, 0),
 (2, 170, 1),
 (3, 160, 0);


INSERT INTO leaderboard (user_id, `rank`, total_distance, total_time)
VALUES
 (1, 1, 15.5, 90.0),
 (2, 2, 12.3, 85.0),
 (3, 3, 10.0, 75.0);


INSERT INTO posts (user_id, title, content, post_flair)
VALUES
 (1, 'Morning Run', 'Had a great run today in the park.', 'Motivation'),
 (2, 'Evening Jog', 'Enjoyed an evening jog around the neighborhood.', 'Lifestyle'),
 (3, 'New PR!', 'I set a new personal record in my 5K!', 'Achievement');


INSERT INTO comments (post_id, user_id, content)
VALUES
 (1, 2, 'Great job, keep it up!'),
 (2, 3, 'That looks fun!'),
 (3, 1, 'Congratulations on your PR!');


INSERT INTO `groups` (name, description)
VALUES
 ('City Runners', 'A group for urban runners.'),
 ('Early Birds', 'For those who run early in the morning.'),
 ('Trail Blazers', 'Group for off-road and trail running.');


INSERT INTO friends (user_one_id, user_two_id, status)
VALUES
 (1, 2, 'accepted'),
 (1, 3, 'pending'),
 (2, 3, 'blocked');


INSERT INTO weekly_summaries (user_id, week_start_date, total_distance, total_time, total_calories)
VALUES
 (1, '2025-04-06', 25.5, 150.0, 1200),
 (2, '2025-04-06', 20.0, 140.0, 1000),
 (3, '2025-04-06', 30.0, 180.0, 1500);


INSERT INTO run_shares (run_id, shared_with_email)
VALUES
 (1, 'friend1@example.com'),
 (2, 'friend2@example.com'),
 (3, 'friend3@example.com');


INSERT INTO group_membership (group_id, user_id)
VALUES
 (1, 1),
 (2, 2),
 (3, 3);


INSERT INTO security_logs (user_id, action, detail, timestamp)
VALUES
 (1, 'LOGIN', 'Successful login', '2025-04-10 08:05:00'),
 (2, 'RUN_CREATION', 'User created a run record', '2025-04-09 08:30:00'),
 (2, 'JOIN_GROUP', 'User joined a group', '2025-04-08 09:00:00');

INSERT INTO coordinates (run_id, time, latitude, longitude)
VALUES
 (1, '2025-04-10 08:00:00', 37.78194, -122.18452),
 (1, '2025-04-10 08:05:00', 37.79514, -122.17767),
 (1, '2025-04-10 08:10:00', 37.79834, -122.15125),
 (1, '2025-04-09 07:30:00', 37.79691, -122.13217),
 (1, '2025-04-09 07:35:00', 37.80884, -122.1409),
 (1, '2025-04-09 07:40:00', 37.83397, -122.12737),
 (1, '2025-04-08 06:45:00', 37.84161, -122.12189),
 (1, '2025-04-08 06:50:00', 37.84934, -122.15271), 
 (2, '2025-04-10 09:00:00',  53.57881, -0.65926),
 (2, '2025-04-10 09:05:00',  53.5789264, -0.6591636),
 (2, '2025-04-10 09:10:00',  53.5789901, -0.6589544),
 (2, '2025-04-09 09:30:00',  53.5790889, -0.6583911),
 (2, '2025-04-09 09:35:00',  53.5792545, -0.6579083),
 (2, '2025-04-09 09:40:00',  53.5792927, -0.657801),
 (2, '2025-04-08 09:45:00',  53.5800794, -0.6570178),
 (2, '2025-04-08 09:50:00',  53.5808947, -0.6562722),
  (2, '2025-04-10 09:00:00', 53.5809074, -0.6563795),
 (2, '2025-04-10 09:05:00',  53.5809106, -0.6566477),
 (2, '2025-04-10 09:10:00',  53.5809297, -0.6568515),
 (2, '2025-04-09 09:30:00',  53.5809424, -0.6570607),
 (2, '2025-04-09 09:35:00',  53.5809297, -0.6574041),
 (2, '2025-04-09 09:40:00',  53.5809361, -0.6578064),
 (2, '2025-04-08 09:45:00',  53.580694, -0.6584018),
 (2, '2025-04-08 09:50:00',  53.5807036, -0.6585574),
(2, '2025-04-10 09:00:00',  53.58078, -0.6587183),
 (2, '2025-04-10 09:05:00',  53.5808182, -0.6588095),
 (2, '2025-04-10 09:10:00',  53.5809393, -0.6588686),
 (2, '2025-04-09 09:30:00',  53.5810125, -0.6589651),
 (2, '2025-04-09 09:35:00',  53.5810603, -0.6591636),
 (2, '2025-04-09 09:40:00',  53.580987, -0.6595981),
 (2, '2025-04-08 09:45:00',  53.5806908, -0.660156),
 (2, '2025-04-08 09:50:00',  53.580659, -0.6603652),
  (2, '2025-04-10 09:00:00', 53.5805889, -0.6606549),
 (2, '2025-04-10 09:05:00',  53.5804488, -0.6609231),
 (2, '2025-04-10 09:10:00',  53.5803628, -0.661304),
 (2, '2025-04-09 09:30:00',  53.5803087, -0.6616741),
 (2, '2025-04-09 09:35:00',  53.5803087, -0.6621408),
 (2, '2025-04-09 09:40:00',  53.5803023, -0.6628221),
 (2, '2025-04-08 09:45:00',  53.5803341, -0.6636214),
 (2, '2025-04-08 09:50:00',  53.5803246, -0.6641257),
 (2, '2025-04-10 09:00:00',  53.5802927, -0.6646514),
 (2, '2025-04-10 09:05:00',  53.5803055, -0.665338),
 (2, '2025-04-10 09:10:00',  53.5803214, -0.6655794),
 (2, '2025-04-09 09:30:00',  53.5801781, -0.66625),
 (2, '2025-04-09 09:35:00',  53.580038, -0.6666899),
 (2, '2025-04-09 09:40:00',  53.5799647, -0.6668508),
 (2, '2025-04-08 09:45:00',  53.57985, -0.666883),
 (2, '2025-04-08 09:50:00',  53.5797195, -0.6665289),
 (2, '2025-04-10 09:00:00',  53.579573, -0.6661427),
 (2, '2025-04-10 09:05:00',  53.5794742, -0.6658369),
 (2, '2025-04-10 09:10:00',  53.5793596, -0.6654882),
 (2, '2025-04-09 09:30:00',  53.5792577, -0.6651396),
 (2, '2025-04-09 09:35:00',  53.5791143, -0.6645495),
 (2, '2025-04-09 09:40:00',  53.5790252, -0.6640559),
 (2, '2025-04-08 09:45:00',  53.5789392, -0.6634605),
 (2, '2025-04-08 09:50:00',  53.57885, -0.6627578),
 (2, '2025-04-10 09:00:00',  53.578815, -0.6621677),
 (2, '2025-04-10 09:05:00',  53.5788054, -0.6613952),
 (2, '2025-04-10 09:10:00',  53.5787958, -0.6606281),
 (2, '2025-04-09 09:30:00',  53.5788277, -0.6598663),
 (2, '2025-04-09 09:35:00',  53.5788372, -0.65939962)