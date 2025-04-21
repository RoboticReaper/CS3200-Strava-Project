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
 (1, 168, 1), (2, 155, 0), (3, 182, 1); -- Removed duplicate inserts for user_id 1, 2, 3 from the end


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
 (12, 'Planning My Next Race', 'Looking at the calendar for my next running event.', 'Race Planning', '2025-06-04 10:00:00'),
 (38, 'Morning Run!!!', 'Had a great run today in the park.', 'Motivation', '2025-04-10 09:00:00');



INSERT INTO comments (post_id, user_id, content, created_at)
VALUES
 (1, 2, 'Great job, keep it up!', '2025-04-10 09:30:00'),
 (2, 3, 'That looks fun!', '2025-04-09 20:00:00'),
 (3, 1, 'Congratulations on your PR!', '2025-04-08 08:00:00'),
 (4, 5, 'Awesome! Marathon training is tough but rewarding.', '2025-04-21 10:30:00'),
 (5, 6, 'Wow, those trails look incredible!', '2025-04-20 17:00:00'),
 (6, 7, 'Nice work on the pace!', '2025-04-19 09:00:00'),
 (7, 8, 'Recovery days are so important.', '2025-04-22 12:30:00'),
 (8, 9, 'Which shoes did you get? Let us know how they feel!', '2025-04-23 18:00:00'),
 (9, 10, 'Running with friends is the best!', '2025-04-24 10:00:00'),
 (10, 11, 'Body Glide or Squirrel\'s Nut Butter works wonders!', '2025-04-25 18:30:00'),
 (11, 12, 'Way to push through!', '2025-04-26 08:15:00'),
 (12, 13, 'Exploring new routes keeps things interesting.', '2025-04-27 11:45:00'),
 (13, 14, 'Chocolate milk is my go-to!', '2025-04-28 19:15:00'),
 (14, 15, 'Rest up and listen to your body. Hope you recover quickly!', '2025-04-29 08:00:00'),
 (15, 16, 'Good luck with the race!', '2025-04-30 11:00:00'),
 (16, 17, 'Nothing beats a peaceful morning run.', '2025-05-01 07:00:00'),
 (17, 18, 'Strength training makes such a difference.', '2025-05-02 16:30:00'),
 (18, 19, 'Amazing! Love seeing wildlife on runs.', '2025-05-03 09:15:00'),
 (19, 20, 'Setting goals is key to staying motivated.', '2025-05-04 13:00:00'),
 (20, 21, 'Water is essential, but sometimes I add electrolyte tabs.', '2025-05-05 17:30:00'),
 (21, 22, 'We all have those days. Showing up is half the battle!', '2025-05-06 09:00:00'),
 (22, 23, 'Running in the rain can be refreshing!', '2025-05-07 11:30:00'),
 (23, 24, 'It\'s great to see how far you\'ve come.', '2025-05-08 19:00:00'),
 (24, 25, 'Congrats on finishing! How did it go?', '2025-05-09 09:45:00'),
 (25, 26, 'Check local running clubs or apps like Meetup.', '2025-05-10 17:15:00'),
 (26, 27, 'Run early or late, wear light clothing, and hydrate well!', '2025-05-11 07:30:00'),
 (27, 28, 'Every win counts! Keep it up!', '2025-05-12 11:00:00'),
 (28, 29, 'Nice find! Exploring local parks is great.', '2025-05-13 19:30:00'),
 (29, 30, 'Dynamic stretches and a short jog usually work for me.', '2025-05-14 08:45:00'),
 (30, 31, 'So true! Running is my therapy.', '2025-05-15 18:00:00'),
 (31, 32, 'Shorten your stride and keep your effort consistent.', '2025-05-16 10:15:00'),
 (32, 33, 'Woohoo! Amazing achievement!', '2025-05-17 11:45:00'),
 (33, 34, 'Best way to see a new city!', '2025-05-18 18:30:00'),
 (34, 35, 'The running community is awesome!', '2025-05-19 07:45:00'),
 (35, 36, 'Thanks for the review! Was thinking about getting that.', '2025-05-20 10:30:00'),
 (36, 37, 'Listen to your body and don\'t be afraid to run slow.', '2025-05-21 17:00:00'),
 (38, 1, 'Lean into the wind slightly, or try to find a sheltered route.', '2025-05-23 12:15:00'),
 (39, 3, 'Keep that energy going!', '2025-05-24 08:00:00'),
 (40, 4, 'Music makes the miles fly by!', '2025-05-25 19:45:00'),
 (41, 5, 'Fantastic! What was the goal?', '2025-05-26 08:30:00'),
 (42, 6, 'Smart move. Recovery is key.', '2025-05-27 12:30:00'),
 (43, 7, 'Good socks are a game changer!', '2025-05-28 17:45:00'),
 (44, 8, 'Weekend long runs are the best.', '2025-05-29 09:30:00'),
 (45, 9, 'Try slowing down your pace or focusing on deep breathing.', '2025-05-30 18:30:00'),
 (46, 10, 'Consistency is everything!', '2025-05-31 08:00:00'),
 (47, 11, 'Love finding hidden trails!', '2025-06-01 11:30:00'),
 (48, 12, 'Oatmeal or a banana usually works for me.', '2025-06-02 20:00:00'),
 (49, 13, 'Rest is just as important as training.', '2025-06-03 07:30:00'),
 (49, 14, 'Exciting! Which race are you considering?', '2025-06-04 10:30:00');


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
 ('Charity Challenge Champions', 'Running for a cause.'),
 ('Beginner Runners United', 'Support and advice for new runners.'),
 ('Ultra Endurance Crew', 'For runners tackling ultra-marathon distances.'),
 ('Run Commuters Collective', 'Sharing tips for running to/from work.'),
 ('Mindful Miles Club', 'Focusing on the mental benefits of running.'),
 ('Music Motivation Miles', 'Sharing running playlists and music talk.'),
 ('Obstacle Course Racers (OCR)', 'Training and tips for OCR events.'),
 ('Barefoot & Minimalist Runners', 'Exploring minimalist running styles.'),
 ('Run Streak Squad', 'Supporting runners maintaining a daily run streak.'),
 ('Triathlon Transition Team', 'For runners who also swim and bike.'),
 ('Masters Milers (40+)', 'Connecting experienced runners over 40.'),
 ('College Campus Cruisers', 'Running groups based at universities.'),
 ('Corporate Challenge Crew', 'Teams participating in corporate running events.'),
 ('Run for Fun Folks', 'Casual running group focused on enjoyment.'),
 ('Plogging Posse (Pick up Litter)', 'Combining running with environmental cleanup.'),
 ('Night Owl Navigators', 'For runners who prefer late-night runs.'),
 ('Run Walk Repeat', 'Interval training group using run/walk method.'),
 ('Costume Crusaders Run Club', 'Running in fun costumes for races or events.'),
 ('Mountain Goat Milers', 'Specializing in steep mountain and hill running.'),
 ('Beach Bound Runners', 'Enjoying runs along the coastline.'),
 ('Desert Dashers', 'Running in arid and desert environments.'),
 ('Forest Frolickers', 'Exploring runs through wooded areas.'),
 ('Rural Route Runners', 'Enjoying the peace of running in the countryside.'),
 ('Suburban Striders', 'Neighborhood running groups in suburban areas.'),
 ('Track Tuesday Team', 'Structured track workouts for speed improvement.'),
 ('Tempo Thursday Tribe', 'Focused group runs at tempo pace.'),
 ('Fartlek Fun Group', 'Incorporating playful speed variations (Fartlek).'),
 ('Interval Intensity Crew', 'High-intensity interval training (HIIT) for runners.'),
 ('Stroller Strong Squad', 'Parents running with jogging strollers.'),
 ('Run Happy Hour Club', 'Social runs followed by drinks/food.'),
 ('Global Run Day Enthusiasts', 'Celebrating and organizing Global Run Day events.'),
 ('New Year Resolution Runners', 'Supporting running goals set at New Year.'),
 ('Spring Sprint Starters', 'Getting back into running in the springtime.'),
 ('Summer Sweat Sessions', 'Tips for running safely in summer heat.'),
 ('Autumn Leaves Runners', 'Enjoying the beauty of fall running.'),
 ('Winter Warrior Workouts', 'Braving the cold for winter runs.'),
 ('Run Photography Fans', 'Sharing photos taken during runs.'),
 ('Running Podcast Listeners', 'Discussing favorite running podcasts.'),
 ('Running Book Club', 'Reading and discussing running-related books.'),
 ('Gear Geeks Gathering', 'Deep dives into running shoes, apparel, and tech.'),
 ('DIY Race Directors', 'Organizing small, informal running events.'),
 ('Volunteer Victory Team', 'Volunteering at local races and events.'),
 ('Run Coach Connect', 'A space for running coaches to share insights.'),
 ('Physical Therapy Pointers', 'Sharing advice from physical therapists for runners.'),
 ('Chiropractic Care Crew', 'Discussing chiropractic benefits for runners.'),
 ('Massage & Recovery Methods', 'Sharing tips on massage and recovery tools.'),
 ('Yoga for Runners Group', 'Integrating yoga practice for flexibility and strength.'),
 ('Pilates Power Runners', 'Using Pilates to enhance core strength for running.'),
 ('Strength Training Synergy', 'Focusing on weightlifting and strength for runners.'),
 ('Mind Over Miles Mentality', 'Developing mental toughness for running.'),
 ('Visualization Voyagers', 'Using visualization techniques for performance.'),
 ('Goal Getters Guild', 'Setting and tracking ambitious running goals.'),
 ('PR Pursuers Posse', 'Focused on achieving new personal records.'),
 ('Comeback Champions Crew', 'Supporting runners returning from breaks or injury.'),
 ('Running Event Travelers', 'Planning trips around destination races.'),
 ('Local Race Locators', 'Sharing information about races in specific regions.'),
 ('Parkrun Participants Network', 'Connecting runners who frequent Parkrun events.'),
 ('Run Across America (Virtual)', 'Virtual challenge group running the distance of the US.'),
 ('Charity Miles Champions', 'Using apps that donate to charity per mile run.'),
 ('RunBet Bettors Brigade', 'Participating in RunBet challenges for motivation.'),
 ('Strava Segment Stalkers', 'Competing for Strava segment KOMs/QOMs.'),
 ('Garmin Gurus Group', 'Sharing tips and tricks for Garmin devices.'),
 ('Apple Watch Athletes', 'Connecting runners using Apple Watch for tracking.'),
 ('Fitbit Fleet Footers', 'Group for runners using Fitbit devices.'),
 ('COROS Crew Collective', 'Users of COROS watches sharing experiences.'),
 ('Suunto Summit Seekers', 'Connecting runners using Suunto devices.'),
 ('Polar Pace Partners', 'Group for Polar watch users.'),
 ('Zwift Run Zone', 'Virtual running on Zwift platform.'),
 ('Peloton Tread Tribe', 'Connecting users of the Peloton Tread.'),
 ('NordicTrack Navigators', 'Group for NordicTrack treadmill users.'),
 ('Runkeeper Record Runners', 'Users of the Runkeeper app.'),
 ('MapMyRun Mappers', 'Connecting users of the MapMyRun app.'),
 ('Nike Run Club (NRC) Network', 'Users of the Nike Run Club app.'),
 ('Adidas Runners Alliance', 'Connecting runners using the Adidas Running app.'),
 ('Puma Prowlers Pack', 'Runners who favor Puma running gear.'),
 ('Brooks Beasts Brigade', 'Fans of Brooks running shoes and apparel.'),
 ('Saucony Striders Society', 'Runners who prefer Saucony gear.'),
 ('HOKA High Flyers', 'Enthusiasts of HOKA ONE ONE shoes.'),
 ('New Balance Navigators', 'Group for New Balance runners.'),
 ('ASICS Agile Athletes', 'Runners who use ASICS gear.'),
 ('Mizuno Milers Mob', 'Fans of Mizuno running products.'),
 ('Altra Aficionados Association', 'Runners who prefer Altra zero-drop shoes.'),
 ('On Cloud Cruisers', 'Users of On running shoes.'),
 ('Salomon Speedcross Squad', 'Trail runners using Salomon gear.'),
 ('La Sportiva Legends League', 'Mountain and trail runners favoring La Sportiva.'),
 ('Inov-8 Innovators', 'Runners using Inov-8 shoes and gear.'),
 ('Rabbit Runners Roost', 'Fans of Rabbit running apparel.'),
 ('Tracksmith Track Team', 'Enthusiasts of Tracksmith running wear.'),
 ('Janji Journey Joggers', 'Supporters of Janji apparel and their mission.'),
 ('Oiselle Volée Voices', 'Members and fans of the Oiselle Volée team.'),
 ('Balega Best Foot Forward', 'Fans of Balega running socks.'),
 ('Feetures Foot Force', 'Runners who prefer Feetures socks.'),
 ('Goodr Glasses Groupies', 'Enjoying runs with Goodr sunglasses.'),
 ('Nathan Hydration Heroes', 'Users of Nathan hydration packs and belts.'),
 ('Ultimate Direction Unit', 'Runners using Ultimate Direction gear.'),
 ('CamelBak Crew', 'Fans of CamelBak hydration solutions.'),
 ('GU Energy Gel Gurus', 'Discussing GU energy products.'),
 ('Maurten Fuel Masters', 'Users of Maurten hydrogel fuel.'),
 ('Tailwind Trailblazers', 'Runners using Tailwind Nutrition.'),
 ('Skratch Labs Sippers', 'Fans of Skratch Labs hydration and fuel.'),
 ('Nuun Hydration Nation', 'Users of Nuun electrolyte tablets.'),
 ('Honey Stinger Hive', 'Runners fueling with Honey Stinger products.'),
 ('Clif Bar Climbers', 'Using Clif Bar products for energy.'),
 ('Spring Energy Sprinters', 'Fans of Spring Energy gels.'),
 ('Run Gum Runners', 'Using Run Gum for an energy boost.'),
 ('Aftershokz Audio Athletes', 'Runners using Aftershokz bone conduction headphones.'),
 ('Jaybird Jammers Joggers', 'Users of Jaybird wireless earbuds.'),
 ('Bose Sound Sprinters', 'Running with Bose headphones.'),
 ('Jabra Journey Crew', 'Users of Jabra earbuds for running.'),
 ('RunSignUp Race Roster', 'Discussing races found on RunSignUp.'),
 ('Active Network Athletes', 'Finding events through Active.com.'),
 ('Race Raves Reviewers', 'Sharing reviews of races on Race Raves.'),
 ('BibRave Buff Brigade', 'Runners testing gear and races via BibRave.'),
 ('Athlinks Athlete Arena', 'Tracking race results and connecting on Athlinks.'),
 ('Running Warehouse Warriors', 'Sharing deals and reviews from Running Warehouse.'),
 ('Road Runner Sports Racers', 'Customers of Road Runner Sports.'),
 ('Fleet Feet Fleet', 'Connecting with local Fleet Feet running stores.'),
 ('REI Run Ready', 'Runners who shop for gear at REI.'),
 ('Local Running Store Loyalists', 'Supporting independent running shops.'),
 ('Virtual Run Challenge Crew', 'Participating in various virtual run challenges.'),
 ('Run the Year Team', 'Group aiming to run the number of miles in the year.'),
 ('401 Run Club (Virtual)', 'Inspired by Ben Smith\'s 401 Challenge.'),
 ('Six Star Finisher Seekers', 'Aiming to complete all World Marathon Majors.'),
 ('Spartan Sprint Squad', 'Training for Spartan Sprint OCR races.'),
 ('Tough Mudder Team', 'Preparing for Tough Mudder events.'),
 ('Color Run Crew', 'Participating in The Color Run events.'),
 ('Rock \'n\' Roll Runners', 'Fans of the Rock \'n\' Roll Marathon Series.'),
 ('Disney Run Devotees', 'Participating in runDisney events.');


-- Sample data for group_posts linking posts to groups
INSERT INTO group_posts (post_id, group_id)
VALUES
 (1, 1), -- Post 1 shared with Group 1 (City Runners)
 (2, 2), -- Post 2 shared with Group 2 (Early Birds)
 (3, 3), -- Post 3 shared with Group 3 (Trail Blazers)
 (4, 5), (5, 3), (6, 6), (7, 7), (8, 9), (9, 1), (10, 11), (11, 1), (12, 8), (13, 10), (14, 11), (15, 5),
 (16, 15), (17, 18), (18, 3), (19, 1), (20, 10), (21, 1), (22, 3), (23, 1), (24, 5), (25, 1), (26, 9), (27, 6),
 (28, 8), (29, 18), (30, 1), (31, 6), (32, 6), (33, 8), (34, 1), (35, 9), (36, 18), (38, 9), (39, 1), (40, 2),
 (41, 6), (42, 7), (43, 9), (44, 1), (45, 11), (46, 1), (47, 8), (48, 10), (49, 7), -- Removed duplicate (49, 5)
 (1, 4), (2, 5); -- Removed large block of duplicate inserts


INSERT INTO friends (user_one_id, user_two_id, status)
VALUES
 (1, 2, 'accepted'),
 (1, 3, 'pending'),
 (2, 3, 'blocked'),
 (1, 4, 'accepted'), (1, 5, 'accepted'), (1, 6, 'pending'), (1, 7, 'accepted'), (1, 8, 'blocked'), (1, 9, 'accepted'), (1, 10, 'pending'),
 (2, 4, 'accepted'), (2, 5, 'pending'), (2, 6, 'accepted'), (2, 7, 'blocked'), (2, 8, 'accepted'), (2, 9, 'pending'), (2, 10, 'accepted'),
 (3, 4, 'accepted'), (3, 5, 'accepted'), (3, 6, 'accepted'), (3, 7, 'pending'), (3, 8, 'accepted'), (3, 9, 'blocked'), (3, 10, 'accepted'),
 (4, 5, 'accepted'), (4, 6, 'pending'), (4, 7, 'accepted'), (4, 8, 'accepted'), (4, 9, 'pending'), (4, 10, 'accepted'), (4, 11, 'blocked'),
 (5, 6, 'accepted'), (5, 7, 'accepted'), (5, 8, 'pending'), (5, 9, 'accepted'), (5, 10, 'blocked'), (5, 11, 'accepted'), (5, 12, 'pending'),
 (6, 7, 'accepted'), (6, 8, 'accepted'), (6, 9, 'accepted'), (6, 10, 'pending'), (6, 11, 'accepted'), (6, 12, 'blocked'), (6, 13, 'accepted'),
 (7, 8, 'pending'), (7, 9, 'accepted'), (7, 10, 'accepted'), (7, 11, 'pending'), (7, 12, 'accepted'), (7, 13, 'accepted'), (7, 14, 'blocked'),
 (8, 9, 'accepted'), (8, 10, 'pending'), (8, 11, 'accepted'), (8, 12, 'accepted'), (8, 13, 'pending'), (8, 14, 'accepted'), (8, 15, 'accepted'),
 (9, 10, 'blocked'), (9, 11, 'accepted'), (9, 12, 'pending'), (9, 13, 'accepted'), (9, 14, 'accepted'), (9, 15, 'pending'), (9, 16, 'accepted'),
 (10, 11, 'accepted'), (10, 12, 'accepted'), (10, 13, 'blocked'), (10, 14, 'accepted'), (10, 15, 'pending'), (10, 16, 'accepted'), (10, 17, 'accepted'),
 (11, 12, 'pending'), (11, 13, 'accepted'), (11, 14, 'accepted'), (11, 15, 'blocked'), (11, 16, 'accepted'), (11, 17, 'pending'), (11, 18, 'accepted'),
 (12, 13, 'accepted'), (12, 14, 'pending'), (12, 15, 'accepted'), (12, 16, 'accepted'), (12, 17, 'blocked'), (12, 18, 'accepted'), (12, 19, 'pending'),
 (13, 14, 'accepted'), (13, 15, 'accepted'), (13, 16, 'pending'), (13, 17, 'accepted'), (13, 18, 'accepted'), (13, 19, 'blocked'), (13, 20, 'accepted'),
 (14, 15, 'pending'), (14, 16, 'accepted'), (14, 17, 'accepted'), (14, 18, 'pending'), (14, 19, 'accepted'), (14, 20, 'accepted'), (14, 21, 'blocked'),
 (15, 16, 'accepted'), (15, 17, 'pending'), (15, 18, 'accepted'), (15, 19, 'accepted'), (15, 20, 'pending'), (15, 21, 'accepted'), (15, 22, 'accepted'),
 (16, 17, 'blocked'), (16, 18, 'accepted'), (16, 19, 'pending'), (16, 20, 'accepted'), (16, 21, 'accepted'), (16, 22, 'pending'), (16, 23, 'accepted'),
 (17, 18, 'accepted'), (17, 19, 'accepted'), (17, 20, 'blocked'), (17, 21, 'accepted'), (17, 22, 'pending'), (17, 23, 'accepted'), (17, 24, 'accepted');


INSERT INTO weekly_summaries (user_id, week_start_date, total_distance, total_time, total_calories)
VALUES
 (1, '2025-04-06', 25.5, 150.0, 1200),
 (2, '2025-04-06', 20.0, 140.0, 1000),
 (3, '2025-04-06', 30.0, 180.0, 1500),
 (4, '2025-04-06', 18.2, 110.5, 950),
 (5, '2025-04-06', 22.7, 135.0, 1150),
 (6, '2025-04-06', 15.0, 90.0, 800),
 (7, '2025-04-06', 28.1, 165.0, 1400),
 (8, '2025-04-06', 19.5, 120.0, 1050),
 (9, '2025-04-06', 24.0, 145.0, 1250),
 (10, '2025-04-06', 31.5, 185.0, 1600),
 (11, '2025-04-06', 12.8, 80.0, 700),
 (12, '2025-04-06', 26.3, 155.0, 1350),
 (13, '2025-04-06', 17.9, 105.0, 900),
 (14, '2025-04-06', 29.9, 175.0, 1500),
 (15, '2025-04-06', 14.2, 85.0, 750),
 (1, '2025-04-13', 27.0, 160.0, 1300),
 (2, '2025-04-13', 21.5, 145.0, 1050),
 (3, '2025-04-13', 32.0, 190.0, 1600),
 (4, '2025-04-13', 19.8, 115.0, 1000),
 (5, '2025-04-13', 24.2, 140.0, 1200),
 (6, '2025-04-13', 16.5, 95.0, 850),
 (7, '2025-04-13', 29.6, 170.0, 1450),
 (8, '2025-04-13', 21.0, 125.0, 1100),
 (9, '2025-04-13', 25.5, 150.0, 1300),
 (10, '2025-04-13', 33.0, 195.0, 1700),
 (11, '2025-04-13', 14.3, 85.0, 750),
 (12, '2025-04-13', 27.8, 160.0, 1400),
 (13, '2025-04-13', 19.4, 110.0, 950),
 (14, '2025-04-13', 31.4, 180.0, 1550),
 (15, '2025-04-13', 15.7, 90.0, 800),
 (16, '2025-04-13', 23.1, 138.0, 1180),
 (17, '2025-04-13', 18.8, 112.0, 980),
 (18, '2025-04-13', 26.7, 158.0, 1380),
 (19, '2025-04-13', 13.5, 82.0, 720),
 (20, '2025-04-13', 30.1, 178.0, 1520),
 (21, '2025-04-13', 20.6, 122.0, 1080),
 (22, '2025-04-13', 28.9, 172.0, 1480),
 (23, '2025-04-13', 15.1, 91.0, 810),
 (24, '2025-04-13', 24.8, 148.0, 1280),
 (25, '2025-04-13', 19.0, 114.0, 1000),
 (26, '2025-04-13', 32.5, 192.0, 1650),
 (27, '2025-04-13', 12.1, 78.0, 680),
 (28, '2025-04-13', 27.3, 163.0, 1420),
 (29, '2025-04-13', 22.4, 133.0, 1150),
 (30, '2025-04-13', 34.0, 200.0, 1750),
 (31, '2025-04-13', 10.5, 70.0, 600),
 (32, '2025-04-13', 25.9, 154.0, 1340),
 (33, '2025-04-13', 20.0, 118.0, 1040),
 (34, '2025-04-13', 29.2, 174.0, 1500),
 (35, '2025-04-13', 16.9, 100.0, 880);


INSERT INTO run_shares (run_id, shared_with_email)
VALUES
 (1, 'friend1@example.com'),
 (2, 'friend2@example.com'),
 (3, 'friend3@example.com'),
 (4, 'colleague@work.com'), (5, 'runningbuddy@email.com'), (6, 'family@domain.net'), (7, 'coach@trainers.org'), (8, 'neighbor@street.com'),
 (9, 'friend4@example.com'), (10, 'teammate@club.com'), (11, 'partner@life.com'), (12, 'studygroup@university.edu'), (13, 'friend5@example.com'),
 (14, 'mentor@guidance.com'), (15, 'client@business.com'), (16, 'friend6@example.com'), (17, 'acquaintance@network.com'), (18, 'penpal@letters.com'),
 (19, 'friend7@example.com'), (20, 'roommate@apartment.com'), (21, 'classmate@school.org'), (22, 'friend8@example.com'), (23, 'cousin@family.com'),
 (24, 'sibling@home.net'), (25, 'friend9@example.com'), (26, 'boss@company.com'), (27, 'trainer@gym.com'), (28, 'friend10@example.com'),
 (29, 'doctor@clinic.com'), (30, 'therapist@health.org'), (31, 'friend11@example.com'), (32, 'accountant@finance.com'), (33, 'lawyer@legal.com'),
 (34, 'friend12@example.com'), (35, 'investor@money.com'),
 -- (36, 'agent@talent.com'), (37, 'friend13@example.com'), (38, 'publisher@books.com'), -- Commented out potentially problematic run_ids
 (1, 'anotherfriend@sample.org'), (2, 'guest@event.com'), (3, 'participant@study.edu'), (4, 'volunteer@charity.org'), (5, 'supporter@cause.com'),
 (6, 'member@community.net'), (7, 'subscriber@newsletter.com'), (8, 'follower@social.com'), (9, 'contact@list.com'), (10, 'lead@sales.com');


INSERT INTO group_membership (group_id, user_id)
VALUES
 (1, 1),
 (2, 2),
 (3, 3),
 (1, 4), (1, 5), (1, 9), (1, 12), (1, 15), (1, 20), (1, 25), (1, 30), (1, 35),
 (2, 6), (2, 10), (2, 14), (2, 18), (2, 22), (2, 26), (2, 31), (2, 36),
 (3, 7), (3, 11), (3, 16), (3, 21), (3, 27), (3, 32), (3, 37),
 (4, 1), (4, 8), (4, 13), (4, 19), (4, 24), (4, 29), (4, 34), (4, 38),
 (5, 4), (5, 15), (5, 23), (5, 33), (5, 5), (5, 17), (5, 28), -- Removed large block of duplicate inserts
 (6, 6), (6, 16), (6, 26), (6, 36), (6, 9), (6, 19), (6, 29),
 (7, 7), (7, 17), (7, 27), (7, 37), (7, 2), (7, 12), (7, 22),
 (8, 8), (8, 18), (8, 28), (8, 38), (8, 3), (8, 13), (8, 23),
 (9, 9), (9, 20), (9, 30), (9, 5), (9, 15), (9, 25), (9, 35),
 (10, 10), (10, 21), (10, 31), (10, 1), (10, 11), (10, 24), (10, 34),
 (11, 11), (11, 22), (11, 32), (11, 2), (11, 14), (11, 26), (11, 36),
 (12, 12), (12, 23), (12, 33), (12, 3), (12, 16), (12, 28), (12, 38),
 (13, 13), (13, 24), (13, 34), (13, 4), (13, 18), (13, 30),
 (14, 14), (14, 25), (14, 35), (14, 5), (14, 19), (14, 31),
 (15, 15), (15, 26), (15, 36), (15, 6), (15, 20), (15, 32),
 (16, 16), (16, 27), (16, 37), (16, 7), (16, 21), (16, 33),
 (17, 17), (17, 28), (17, 38), (17, 8), (17, 22), (17, 34),
 (18, 18), (18, 29), (18, 1), (18, 9), (18, 23), (18, 35),
 (19, 19), (19, 30), (19, 2), (19, 10), (19, 24), (19, 36),
 (20, 20), (20, 31), (20, 3), (20, 11), (20, 25), (20, 37);


INSERT INTO security_logs (user_id, action, detail, timestamp)
VALUES
 (1, 'LOGIN', 'Successful login', '2025-04-10 08:05:00'),
 (2, 'RUN_CREATION', 'User created a run record', '2025-04-09 08:30:00'),
 (2, 'JOIN_GROUP', 'User joined a group', '2025-04-08 09:00:00'),
 (3, 'LOGIN_FAIL', 'Incorrect password attempt', '2025-04-10 09:15:00'),
 (4, 'PROFILE_UPDATE', 'User changed profile visibility to hidden', '2025-04-11 10:00:00'),
 (5, 'POST_CREATION', 'User created a new post', '2025-04-11 11:30:00'),
 (6, 'COMMENT_CREATION', 'User commented on post ID 5', '2025-04-12 08:00:00'),
 (7, 'FRIEND_REQUEST', 'User sent friend request to user ID 8', '2025-04-12 14:20:00'),
 (8, 'FRIEND_ACCEPT', 'User accepted friend request from user ID 7', '2025-04-12 15:00:00'),
 (1, 'LOGOUT', 'User logged out', '2025-04-13 09:00:00'),
 (9, 'RUN_UPDATE', 'User updated run ID 6', '2025-04-13 17:00:00'),
 (10, 'RUN_DELETE', 'User deleted run ID 7', '2025-04-14 09:00:00'),
 (11, 'GROUP_LEAVE', 'User left group ID 3', '2025-04-15 10:00:00'),
 (12, 'PASSWORD_CHANGE', 'User successfully changed password', '2025-04-16 11:00:00'),
 (13, 'EMAIL_UPDATE', 'User updated email address', '2025-04-17 12:00:00'),
 (14, 'ALERT_THRESHOLD_UPDATE', 'User updated heart rate alert threshold', '2025-04-18 13:00:00'),
 (15, 'RUN_SHARE', 'User shared run ID 15 via email', '2025-04-19 10:00:00'),
 (16, 'LOGIN', 'Successful login', '2025-04-20 08:30:00'),
 (17, 'POST_DELETE', 'User deleted post ID 17', '2025-04-21 14:00:00'),
 (18, 'COMMENT_DELETE', 'User deleted comment ID 5 (example)', '2025-04-22 15:00:00'),
 (19, 'FRIEND_REMOVE', 'User removed friend ID 13', '2025-04-23 16:00:00'),
 (20, 'PROFILE_VIEW', 'User viewed profile of user ID 1', '2025-04-24 10:00:00'),
 (21, 'GROUP_SEARCH', 'User searched for groups containing "Trail"', '2025-04-25 11:00:00'),
 (22, 'LEADERBOARD_VIEW', 'User viewed the leaderboard', '2025-04-26 12:00:00'),
 (23, 'SUMMARY_VIEW', 'User viewed weekly summary for week 2025-04-13', '2025-04-27 13:00:00'),
 (24, 'LOGIN_FAIL', 'Multiple failed login attempts from IP 192.168.1.100', '2025-04-28 09:00:00'),
 (25, 'ACCOUNT_LOCK', 'Account locked due to suspicious activity', '2025-04-28 09:05:00'),
 (26, 'PASSWORD_RESET_REQUEST', 'User requested password reset link', '2025-04-29 10:00:00'),
 (27, 'PASSWORD_RESET_SUCCESS', 'User successfully reset password via email link', '2025-04-29 10:15:00'),
 (28, 'LOGIN', 'Successful login after password reset', '2025-04-29 10:20:00'),
 (29, 'RUN_FLAGGED', 'Run ID 29 automatically flagged as suspicious', '2025-04-13 07:05:00'),
 (30, 'USER_FLAGGED', 'User ID 30 manually flagged by admin', '2025-05-01 12:00:00'),
 (31, 'API_ACCESS', 'Third-party app accessed run data', '2025-05-02 13:00:00'),
 (32, 'EXPORT_DATA', 'User requested data export', '2025-05-03 14:00:00'),
 (33, 'IMPORT_DATA', 'User imported run data from GPX file', '2025-05-04 15:00:00'),
 (34, 'SETTINGS_UPDATE', 'User updated notification preferences', '2025-05-05 16:00:00'),
 (35, 'GROUP_CREATE', 'User created a new group "Local Joggers"', '2025-05-06 17:00:00'),
 (36, 'GROUP_INVITE', 'User invited user ID 37 to group ID 25', '2025-05-07 18:00:00'),
 (37, 'GROUP_JOIN_INVITE', 'User accepted invitation to join group ID 25', '2025-05-07 18:05:00'),
 (38, 'POST_EDIT', 'User edited post ID 38', '2025-05-08 19:00:00'),
 (1, 'COMMENT_EDIT', 'User edited comment ID 1 (example)', '2025-05-09 20:00:00'),
 (2, 'FRIEND_BLOCK', 'User blocked user ID 3', '2025-05-10 08:00:00'),
 (3, 'FRIEND_UNBLOCK', 'User unblocked user ID 9', '2025-05-11 09:00:00'),
 (4, 'PROFILE_PICTURE_UPDATE', 'User updated profile picture', '2025-05-12 10:00:00'),
 (5, 'LOGIN', 'Successful login via mobile app', '2025-05-13 11:00:00'),
 (6, 'RUN_CREATION', 'Run created via API integration', '2025-05-14 12:00:00'),
 (7, 'ACCOUNT_DEACTIVATION_REQUEST', 'User requested account deactivation', '2025-05-15 13:00:00'),
 (8, 'ACCOUNT_REACTIVATION', 'User reactivated account', '2025-05-16 14:00:00'),
 (9, 'ADMIN_LOGIN', 'Admin user logged in', '2025-05-17 15:00:00'),
 (10, 'ADMIN_ACTION', 'Admin user reviewed flagged run ID 29', '2025-05-17 15:05:00');


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
 (2, '2025-04-09 09:35:00',  53.5788372, -0.65939962);


INSERT INTO friend_posts (post_id, friend_id)
VALUES
 (1, 2), (1, 4), (1, 5), (1, 7), (1, 9), (2, 1), (2, 4), (2, 6), (2, 8), (2, 10),
 (3, 1), (3, 4), (3, 5), (3, 6), (3, 8), (3, 10), (4, 1), (4, 2), (4, 3), (4, 5),
 (4, 6), (4, 7), (4, 8), (4, 9), (4, 10), (5, 1), (5, 2), (5, 3), (5, 4), (5, 6),
 (5, 7), (5, 8), (5, 9), (5, 11), (6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 7),
 (6, 8), (6, 9), (6, 10), (6, 11), (6, 13), (7, 1), (7, 2), (7, 3), (7, 4), (7, 5),
 (7, 6), (7, 9), (7, 10), (7, 12), (7, 13), (8, 1), (8, 2), (8, 3), (8, 4), (8, 5),
 (8, 6), (8, 7), (8, 9), (8, 10), (8, 11), (8, 12), (8, 13), (8, 14), (8, 15), (9, 1),
 (9, 2), (9, 3), (9, 4), (9, 5), (9, 6), (9, 7), (9, 8), (9, 11), (9, 13), (9, 14),
 (9, 15), (9, 16), (10, 1), (10, 2), (10, 3), (10, 4), (10, 5), (10, 6), (10, 7), (10, 8),
 (10, 9), (10, 11), (10, 12), (10, 14), (10, 15), (10, 16), (10, 17), (11, 2), (11, 4), (11, 5),
 (11, 6), (11, 7), (11, 8), (11, 9), (11, 10), (11, 12), (11, 13), (11, 14), (11, 16), (11, 17),
 (11, 18), (12, 3), (12, 5), (12, 6), (12, 7), (12, 8), (12, 9), (12, 10), (12, 11), (12, 13),
 (12, 14), (12, 15), (12, 16), (12, 18), (12, 19);