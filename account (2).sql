-- Adminer 4.7.6 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

INSERT INTO `brands` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1,	'Brand A',	'2021-02-11 10:30:43',	'2021-02-11 10:30:43'),
(2,	'Brand B',	'2021-02-11 10:30:56',	'2021-02-11 10:30:56');

INSERT INTO `categories` (`id`, `name`, `slug`, `createdAt`, `updatedAt`) VALUES
(1,	'Row Material',	'row_material',	'2021-02-01 15:37:41',	'2021-02-01 10:06:03'),
(2,	'Finished Goods',	'finished_goods',	'2021-02-01 15:37:27',	'2021-02-01 10:06:29');

INSERT INTO `cities` (`id`, `state_id`, `name`, `createdAt`, `updatedAt`) VALUES
(1,	1,	'Jaipur',	NULL,	NULL),
(2,	1,	'Kota',	NULL,	NULL),
(3,	2,	'Chandigarh',	NULL,	NULL);

INSERT INTO `groups` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1,	'group 1',	'2020-09-09 12:31:18',	'2020-09-09 12:31:18'),
(2,	'group 2',	'2020-09-09 12:31:26',	'2020-09-09 12:31:26'),
(3,	'group 3',	'2020-09-09 12:31:30',	'2020-09-09 12:31:30'),
(4,	'group 4',	'2020-09-09 12:31:36',	'2020-09-09 12:31:36'),
(6,	'group 5',	'2021-01-09 16:49:05',	'2021-01-09 16:49:05');

INSERT INTO `states` (`id`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(1,	'Rajasthan',	'RJ',	NULL,	NULL),
(2,	'Panjab',	'PN',	NULL,	NULL),
(3,	'Gujrat',	'GJ',	'2021-02-01 12:09:25',	'2021-02-01 12:09:25');

INSERT INTO `units` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1,	'Kg',	'2021-02-03 11:21:28',	'2021-02-03 11:21:28'),
(2,	'Gm',	'2021-02-03 11:21:41',	'2021-02-03 11:21:41');

-- 2021-02-18 07:48:32
