INSERT INTO `dementia_test` (`test_name`, `total_questions`)
VALUES ('smcq', 14);

INSERT INTO `dementia_test` (`test_name`, `total_questions`)
VALUES ('sdq', 32);

insert into ai_dementia_type
values (1,"유저-유저"),
(2,"유저-보호자");

INSERT INTO `game_category` (`category`)
VALUES
    ('기억력'),
    ('사고력'),
    ('집중력'),
    ('순발력'),
    ('논리력');

INSERT INTO `game_list` (`category_id`, `game_name`)
VALUES
    (1, '카드 뒤집기'),       -- 기억력
    (2, '데카르트 가위바위보'), -- 사고력
    (3, '색깔 단어 읽기'),     -- 집중력
    (4, '없는 숫자 찾기'),     -- 순발력
    (5, '숫자 혹은 사칙연산 추론'); -- 논리력
