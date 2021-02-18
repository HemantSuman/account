-- Adminer 4.7.6 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

INSERT INTO `categories` (`id`, `name`, `slug`, `createdAt`, `updatedAt`) VALUES
(1,	'Row Material',	'row_material',	'2021-02-01 15:37:41',	'2021-02-01 10:06:03'),
(2,	'Finished Goods',	'finished_goods',	'2021-02-01 15:37:27',	'2021-02-01 10:06:29');

INSERT INTO `cities` (`id`, `state_id`, `name`, `createdAt`, `updatedAt`) VALUES
(1,	1,	'Jaipur',	NULL,	NULL),
(2,	1,	'Kota',	NULL,	NULL),
(3,	2,	'Chandigarh',	NULL,	NULL);

INSERT INTO `states` (`id`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(1,	'Rajasthan',	'RJ',	NULL,	NULL),
(2,	'Panjab',	'PN',	NULL,	NULL),
(3,	'Gujrat',	'GJ',	'2021-02-01 12:09:25',	'2021-02-01 12:09:25');

INSERT INTO `units` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1,	'Kg',	'2021-02-03 11:21:28',	'2021-02-03 11:21:28'),
(2,	'Gm',	'2021-02-03 11:21:41',	'2021-02-03 11:21:41');

-- 2021-02-18 04:45:07
