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
 total_distance FLOAT NOT NULL,
 total_time FLOAT NOT NULL,
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


CREATE TABLE IF NOT EXISTS posts (
 id INT PRIMARY KEY AUTO_INCREMENT,
 user_id INT NOT NULL,
 title VARCHAR(255) NOT NULL,
 content TEXT NOT NULL,
 post_flair VARCHAR(255) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Added created_at
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS group_posts (
  post_id INT NOT NULL,
  group_id INT NOT NULL,
  PRIMARY KEY (post_id, group_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS friend_posts (
  post_id INT NOT NULL,
  friend_id INT NOT NULL,
  PRIMARY KEY (post_id, friend_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS comments (
 id INT PRIMARY KEY AUTO_INCREMENT,
 post_id INT NOT NULL,
 user_id INT NOT NULL,
 content TEXT NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Added created_at
 FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
 ('Alice', 'Johnson', 'alice.johnson@example.com', 1, 0),
  ('Bob', 'Williams', 'bob.williams@example.com', 0, 0),
 ('Charlie', 'Brown', 'charlie.brown@example.com', 0, 0),
 ('Diana', 'Miller', 'diana.miller@example.com', 1, 0),
 ('Ethan', 'Davis', 'ethan.davis@example.com', 0, 0),
 ('Fiona', 'Garcia', 'fiona.garcia@example.com', 0, 0),
 ('George', 'Rodriguez', 'george.rodriguez@example.com', 0, 0),
 ('Hannah', 'Wilson', 'hannah.wilson@example.com', 1, 0),
 ('Ian', 'Martinez', 'ian.martinez@example.com', 0, 0),
 ('Julia', 'Anderson', 'julia.anderson@example.com', 0, 0),
 ('Kevin', 'Taylor', 'kevin.taylor@example.com', 0, 0),
 ('Laura', 'Moore', 'laura.moore@example.com', 1, 0),
 ('Michael', 'Jackson', 'michael.jackson@example.com', 0, 0),
 ('Nancy', 'Harris', 'nancy.harris@example.com', 0, 0),
 ('Oliver', 'Lewis', 'oliver.lewis@example.com', 0, 0),
 ('Penelope', 'Allen', 'penelope.allen@example.com', 1, 0),
 ('Quentin', 'Young', 'quentin.young@example.com', 0, 0),
 ('Rachel', 'King', 'rachel.king@example.com', 0, 0),
 ('Samuel', 'Wright', 'samuel.wright@example.com', 0, 0),
 ('Theresa', 'Scott', 'theresa.scott@example.com', 1, 0),
 ('Victor', 'Green', 'victor.green@example.com', 0, 0),
 ('Wendy', 'Adams', 'wendy.adams@example.com', 0, 0),
 ('Xavier', 'Baker', 'xavier.baker@example.com', 0, 0),
 ('Yolanda', 'Nelson', 'yolanda.nelson@example.com', 1, 0),
 ('Zachary', 'Carter', 'zachary.carter@example.com', 0, 0),
 ('Sophia', 'Roberts', 'sophia.roberts@example.com', 0, 0),
 ('Daniel', 'Phillips', 'daniel.phillips@example.com', 0, 0),
 ('Emily', 'Campbell', 'emily.campbell@example.com', 1, 0),
 ('Joseph', 'Parker', 'joseph.parker@example.com', 0, 0),
 ('Olivia', 'Evans', 'olivia.evans@example.com', 0, 0),
 ('William', 'Edwards', 'william.edwards@example.com', 0, 0),
 ('Ava', 'Collins', 'ava.collins@example.com', 1, 0),
 ('James', 'Stewart', 'james.stewart@example.com', 0, 0),
 ('Isabella', 'Sanchez', 'isabella.sanchez@example.com', 0, 0),
 ('Benjamin', 'Morris', 'benjamin.morris@example.com', 0, 0),
 ('Mia', 'Rogers', 'mia.rogers@example.com', 1, 0);


INSERT INTO run (user_id, distance, duration, time, calories, avg_pace, suspicious, is_flagged)
VALUES
 (4, 4.5, 25.0, '2025-04-10 09:15:00', 280, 5.5, 0, 0),
 (5, 6.8, 40.0, '2025-04-09 18:00:00', 450, 5.9, 0, 0),
 (6, 2.5, 15.0, '2025-04-08 17:30:00', 200, 6.0, 0, 0),
 (7, 7.5, 45.0, '2025-04-11 07:00:00', 500, 6.0, 0, 0),
 (8, 3.8, 22.0, '2025-04-12 10:00:00', 260, 5.8, 0, 0),
 (9, 5.0, 31.0, '2025-04-13 16:30:00', 310, 6.2, 0, 0),
 (10, 9.2, 55.0, '2025-04-14 08:45:00', 580, 5.9, 0, 0),
 (11, 2.0, 12.0, '2025-04-15 19:00:00', 150, 6.0, 0, 0),
 (12, 6.0, 35.0, '2025-04-16 07:45:00', 400, 5.8, 0, 0),
 (13, 4.0, 23.0, '2025-04-17 11:00:00', 270, 5.7, 0, 0),
 (14, 8.0, 50.0, '2025-04-18 17:00:00', 550, 6.2, 0, 0),
 (15, 3.0, 18.0, '2025-04-19 09:30:00', 220, 6.0, 0, 0),
 (16, 7.0, 42.0, '2025-04-20 08:15:00', 480, 6.0, 0, 0),
 (17, 5.5, 33.0, '2025-04-11 15:45:00', 330, 6.0, 0, 0),
 (18, 2.8, 17.0, '2025-04-12 07:15:00', 210, 6.1, 0, 0),
 (19, 9.5, 58.0, '2025-04-13 10:30:00', 620, 6.1, 0, 0),
 (20, 4.2, 24.0, '2025-04-14 18:30:00', 290, 5.7, 0, 0),
 (21, 6.5, 38.0, '2025-04-15 09:00:00', 430, 5.8, 0, 0),
 (22, 3.5, 21.0, '2025-04-16 16:00:00', 240, 6.0, 0, 0),
 (23, 8.5, 52.0, '2025-04-17 07:30:00', 570, 6.1, 0, 0),
 (24, 2.2, 13.0, '2025-04-18 11:30:00', 170, 5.9, 0, 0),
 (25, 7.8, 47.0, '2025-04-19 17:30:00', 530, 6.0, 0, 0),
 (26, 5.8, 34.0, '2025-04-20 09:45:00', 350, 5.9, 0, 0),
 (27, 3.3, 19.5, '2025-04-11 08:30:00', 230, 5.9, 0, 0),
 (28, 9.0, 56.0, '2025-04-12 15:00:00', 600, 6.2, 0, 0),
 (29, 4.8, 27.0, '2025-04-13 07:00:00', 300, 5.6, 0, 0),
 (30, 6.2, 36.5, '2025-04-14 10:00:00', 410, 5.9, 0, 0),
 (31, 2.6, 16.0, '2025-04-15 17:00:00', 200, 6.2, 0, 0),
 (32, 7.2, 43.0, '2025-04-16 08:30:00', 490, 6.0, 0, 0),
 (33, 5.3, 32.0, '2025-04-17 16:30:00', 320, 6.0, 0, 0),
 (34, 3.7, 21.5, '2025-04-18 09:00:00', 250, 5.8, 0, 0),
 (35, 8.8, 54.0, '2025-04-19 11:00:00', 590, 6.1, 0, 0),
 (36, 4.6, 26.0, '2025-04-20 16:00:00', 290, 5.7, 0, 0),
 (37, 6.9, 41.0, '2025-04-11 09:30:00', 460, 5.9, 0, 0),
 (38, 2.9, 17.5, '2025-04-12 18:00:00', 220, 6.0, 0, 0);


INSERT INTO heart_rate_alerts (user_id, threshold, alert_triggered)
VALUES
 (4, 175, 0), (5, 165, 1), (6, 185, 0), (7, 170, 0), (8, 160, 1),
 (9, 178, 0), (10, 168, 0), (11, 155, 1), (12, 182, 0), (13, 172, 0),
 (14, 162, 1), (15, 179, 0), (16, 169, 0), (17, 158, 1), (18, 181, 0),
 (19, 171, 0), (20, 161, 1), (21, 177, 0), (22, 167, 0), (23, 156, 1),
 (24, 183, 0), (25, 173, 0), (26, 163, 1), (27, 176, 0), (28, 166, 0),
 (29, 157, 1), (30, 184, 0), (31, 174, 0), (32, 164, 1), (33, 175, 1),
 (34, 165, 0), (35, 180, 1), (36, 170, 1), (37, 160, 0), (38, 178, 1),
 (1, 168, 1), (2, 155, 0), (3, 182, 1);


INSERT INTO leaderboard (user_id, total_distance, total_time)
VALUES
 (1, 15.5, 90.0),
 (2, 12.3, 85.0),
 (3, 10.0, 75.0),
 (4, 22.1, 130.5), (5, 15.9, 95.0), (6, 28.7, 162.0), (7, 11.1, 70.0), (8, 25.3, 154.0),
 (9, 18.8, 118.0), (10, 30.5, 177.0), (11, 9.9, 65.0), (12, 23.5, 140.0), (13, 17.1, 105.5),
 (14, 29.1, 169.0), (15, 12.2, 78.5), (16, 27.8, 167.0), (17, 19.1, 120.5), (18, 26.6, 159.0),
 (19, 10.5, 68.0), (20, 24.3, 145.5), (21, 16.7, 100.0), (22, 28.3, 170.0), (23, 13.4, 82.0),
 (24, 22.9, 137.0), (25, 17.5, 108.0), (26, 29.5, 173.0), (27, 11.8, 75.0), (28, 26.1, 156.5),
 (29, 19.8, 125.0), (30, 31.0, 180.0), (31, 9.0, 60.0), (32, 21.7, 130.0), (33, 18.1, 112.0),
 (34, 27.0, 160.0), (35, 14.5, 90.0), (36, 25.7, 150.0), (37, 20.1, 128.0), (38, 32.0, 185.0),
 (1, 35.5, 200.0), (2, 28.3, 195.0), (3, 30.0, 175.0), (4, 24.1, 140.0), (5, 31.8, 188.0),
 (6, 20.5, 120.0), (7, 33.5, 190.0), (8, 26.8, 165.0), (9, 29.0, 170.0), (10, 22.5, 135.0),
 (11, 34.2, 198.0), (12, 27.3, 168.0), (13, 30.8, 182.0), (14, 23.0, 138.0), (15, 31.5, 185.0);



INSERT INTO posts (user_id, title, content, post_flair, created_at)
VALUES
 (1, 'Morning Run', 'Had a great run today in the park.', 'Motivation', '2025-04-10 09:00:00'),
 (2, 'Evening Jog', 'Enjoyed an evening jog around the neighborhood.', 'Lifestyle', '2025-04-09 19:30:00'),
 (3, 'New PR!', 'I set a new personal record in my 5K!', 'Achievement', '2025-04-08 07:15:00'),
  (4, 'First Marathon Training Run', 'Just finished my first long run for marathon training!', 'Training', '2025-04-21 10:00:00'),
 (5, 'Trail Run Adventure', 'Explored some amazing trails today. The scenery was breathtaking!', 'Adventure', '2025-04-20 16:30:00'),
 (6, 'Pace Improvement!', 'Managed to shave off some time on my usual route. Feeling faster!', 'Achievement', '2025-04-19 08:45:00'),
 (7, 'Recovery Day', 'Taking it easy today with a short, slow jog.', 'Recovery', '2025-04-22 12:15:00'),
 (8, 'New Running Shoes!', 'Excited to try out my new pair of running shoes.', 'Gear', '2025-04-23 17:45:00'),
 (9, 'Running with Friends', 'Had a fun run with my running buddies this morning.', 'Social', '2025-04-24 09:30:00'),
 (10, 'Dealing with Chafing', 'Any tips for preventing chafing on long runs?', 'Question', '2025-04-25 18:15:00'),
 (11, 'Motivation Boost', 'Needed a little extra push today, but I got it done!', 'Motivation', '2025-04-26 08:00:00'),
 (12, 'Exploring a New Route', 'Discovered a beautiful new place to run in my city.', 'Exploration', '2025-04-27 11:30:00'),
 (13, 'Post-Run Fuel', 'What are your favorite post-run snacks?', 'Nutrition', '2025-04-28 19:00:00'),
 (14, 'Dealing with Injury', 'Dealing with a minor injury. Any advice for recovery?', 'Injury', '2025-04-29 07:45:00'),
 (15, 'Race Day Prep', 'Getting everything ready for my upcoming race!', 'Race', '2025-04-30 10:30:00'),
 (16, 'Morning Miles', 'Enjoying the quiet of an early morning run.', 'Lifestyle', '2025-05-01 06:45:00'),
 (17, 'Strength Training for Runners', 'Incorporating more strength training into my routine.', 'Training', '2025-05-02 16:00:00'),
 (18, 'Wildlife on the Trail', 'Spotted some deer on my trail run today!', 'Nature', '2025-05-03 09:00:00'),
 (19, 'Setting New Goals', 'Thinking about my running goals for the next few months.', 'Goal Setting', '2025-05-04 12:30:00'),
 (20, 'Hydration Tips', 'Staying hydrated is key! What are your favorite ways to hydrate?', 'Nutrition', '2025-05-05 17:00:00'),
 (21, 'Overcoming a Bad Run', 'Had a tough run today, but I still showed up!', 'Motivation', '2025-05-06 08:30:00'),
 (22, 'Running in the Rain', 'Embracing the rain on my run today!', 'Adventure', '2025-05-07 11:00:00'),
 (23, 'Reflecting on Progress', 'Looking back at how far I\'ve come in my running journey.', 'Reflection', '2025-05-08 18:30:00'),
 (24, 'Race Report', 'Just finished a race! Here\'s how it went...', 'Race Report', '2025-05-09 09:15:00'),
 (25, 'Finding Running Buddies', 'Looking for more people to run with in my area.', 'Social', '2025-05-10 16:45:00'),
 (26, 'Dealing with Heat', 'Tips for running in hot weather?', 'Question', '2025-05-11 07:00:00'),
 (27, 'Celebrating Small Wins', 'Every mile counts! Celebrating a small personal victory today.', 'Achievement', '2025-05-12 10:30:00'),
 (28, 'Exploring Local Parks', 'Found a new park with great running paths.', 'Exploration', '2025-05-13 19:00:00'),
 (29, 'Pre-Run Routine', 'What does your pre-run warm-up look like?', 'Training', '2025-05-14 08:15:00'),
 (30, 'Running and Mental Health', 'How running helps with my mental well-being.', 'Lifestyle', '2025-05-15 17:30:00'),
 (31, 'Dealing with Hills', 'Tips for tackling those tough inclines?', 'Question', '2025-05-16 09:45:00'),
 (32, 'Setting a New Personal Best', 'So happy to announce a new PB!', 'Achievement', '2025-05-17 11:15:00'),
 (33, 'Running in Different Cities', 'Enjoying exploring new cities through running.', 'Travel', '2025-05-18 18:00:00'),
 (34, 'Community Love', 'Feeling grateful for the amazing running community.', 'Social', '2025-05-19 07:15:00'),
 (35, 'Gear Review', 'My thoughts on a new piece of running gear I tried.', 'Gear Review', '2025-05-20 10:00:00'),
 (36, 'Finding Your Pace', 'Tips for finding a comfortable and sustainable running pace.', 'Training', '2025-05-21 16:30:00'),
 (38, 'Dealing with Wind', 'Strategies for running on windy days?', 'Question', '2025-05-23 11:45:00'),
 (1, 'Another Great Morning Run', 'Feeling energized after my run this morning.', 'Motivation', '2025-05-24 07:45:00'),
 (2, 'Evening Run with Music', 'Enjoyed my evening jog with some good tunes.', 'Lifestyle', '2025-05-25 19:15:00'),
 (3, 'Crushed My Goal!', 'So happy to have achieved another running goal!', 'Achievement', '2025-05-26 08:00:00'),
 (4, 'Short and Sweet Recovery', 'A short recovery run to keep the legs moving.', 'Recovery', '2025-05-27 12:00:00'),
 (5, 'Loving My New Socks!', 'Never underestimate the importance of good running socks!', 'Gear', '2025-05-28 17:15:00'),
 (6, 'Weekend Run with the Crew', 'Great long run with my weekend running group.', 'Social', '2025-05-29 09:00:00'),
 (7, 'Dealing with Side Stitches', 'Any remedies for those annoying side stitches?', 'Question', '2025-05-30 18:00:00'),
 (8, 'Staying Consistent', 'The key is consistency! Showing up even on tough days.', 'Motivation', '2025-05-31 07:30:00'),
 (9, 'Exploring Hidden Gems', 'Found a hidden trail in my neighborhood today.', 'Exploration', '2025-06-01 11:00:00'),
 (10, 'Fueling for a Long Run', 'What do you eat before a long run?', 'Nutrition', '2025-06-02 19:30:00'),
 (11, 'Recovering from a Race', 'Taking it easy after a challenging race.', 'Recovery', '2025-06-03 07:00:00'),
 (12, 'Planning My Next Race', 'Looking at the calendar for my next running event.', 'Race Planning', '2025-06-04 10:00:00');



INSERT INTO comments (post_id, user_id, content, created_at)
VALUES
 (1, 2, 'Great job, keep it up!', '2025-04-10 09:30:00'),
 (2, 3, 'That looks fun!', '2025-04-09 20:00:00'),
 (3, 1, 'Congratulations on your PR!', '2025-04-08 08:00:00');


INSERT INTO `groups` (name, description)
VALUES
 ('City Runners', 'A group for urban runners.'),
 ('Early Birds', 'For those who run early in the morning.'),
 ('Trail Blazers', 'Group for off-road and trail running.'),
  ('Weekend Warriors', 'For those who get their runs in on weekends.'),
 ('Marathon Fanatics', 'Dedicated to marathon training and racing.'),
 ('Speed Demons', 'Focusing on improving pace and speed work.'),
 ('Recovery Runners', 'Emphasizing easy runs and injury prevention.'),
 ('Global Trotters', 'Runners who love to explore new places through running.'),
 ('Tech Savvy Striders', 'Discussing running gadgets and apps.'),
 ('Nutrition Ninjas', 'Sharing tips on fueling for runs.'),
 ('Injury Insights', 'A supportive space for dealing with running injuries.'),
 ('Half Marathon Heroes', 'Training and support for half marathons.'),
 ('5K Fan Club', 'Celebrating the joy of the 5K distance.'),
 ('10K Trailblazers', 'Exploring 10K races on various terrains.'),
 ('Morning Glory Runners', 'Enjoying the peace of early morning runs.'),
 ('Evening Striders', 'Fitting in runs after work or other commitments.'),
 ('Treadmill Titans', 'Making the most of indoor running.'),
 ('Cross-Training Crew', 'Incorporating other activities into running routines.'),
 ('Parent Pacers', 'Running with strollers or juggling family and running.'),
 ('Dog Joggers', 'Enjoying runs with canine companions.'),
 ('Photography Finishers', 'Capturing the beauty of running routes.'),
 ('Bookworms on the Run', 'Discussing audiobooks and podcasts while running.'),
 ('Coffee Chasers Run Club', 'Social runs ending with coffee.'),
 ('Sunrise Sprint Society', 'Dedicated to early morning speed workouts.'),
 ('Sunset Saunterers', 'Relaxed evening runs as the sun sets.'),
 ('Urban Explorers on Foot', 'Discovering cityscapes through running.'),
 ('Wilderness Wanderers', 'Venturing into nature for trail runs.'),
 ('Hill Repeater Heroes', 'Conquering challenging inclines.'),
 ('Long Run Legends', 'Sharing experiences and tips for endurance runs.'),
 ('Virtual Victory Voyagers', 'Connecting through virtual races and challenges.'),
 ('Charity Challenge Champions', 'Running for a cause.');

-- Sample data for group_posts linking posts to groups
INSERT INTO group_posts (post_id, group_id)
VALUES
 (1, 1), -- Post 1 shared with Group 1 (City Runners)
 (2, 2), -- Post 2 shared with Group 2 (Early Birds)
 (3, 3); -- Post 3 shared with Group 3 (Trail Blazers)

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