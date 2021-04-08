INSERT INTO `roles` (`name`, `slug`, `createdAt`, `updatedAt`)
VALUES ('Superadmin', 'superadmin', now(), now());

INSERT INTO `roles` (`name`, `slug`, `createdAt`, `updatedAt`)
VALUES ('Operator', 'operator', now(), now());

ALTER TABLE `users`
ADD `role_id` int(11) NULL AFTER `last_name`,
ADD FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT;

UPDATE `users` SET `role_id` = '1' WHERE `id` = '2';

INSERT INTO `modules` (`id`, `name`, `slug`, `createdAt`, `updatedAt`) VALUES
(1,	'Groups',	'groups',	'2021-04-04 01:34:33',	'2021-04-04 01:34:33'),
(2,	'Brands',	'brands',	'2021-04-04 01:34:59',	'2021-04-04 01:34:59'),
(3,	'States',	'states',	'2021-04-04 01:35:23',	'2021-04-04 01:35:23'),
(4,	'Categories',	'categories',	'2021-04-04 01:36:03',	'2021-04-04 01:36:03'),
(5,	'Companies',	'companies',	'2021-04-04 01:36:49',	'2021-04-04 01:36:49'),
(6,	'Accounts',	'accounts',	'2021-04-04 01:37:14',	'2021-04-04 01:37:14'),
(7,	'Items',	'items',	'2021-04-04 01:37:38',	'2021-04-04 01:37:38'),
(8,	'Invoices',	'invoices',	'2021-04-04 01:38:03',	'2021-04-04 01:38:03'),
(9,	'Taxes',	'taxes',	'2021-04-04 01:38:26',	'2021-04-04 01:38:26'),
(10,	'Purchases',	'purchases',	'2021-04-04 01:38:53',	'2021-04-04 01:38:53'),
(11,	'Productions',	'productions',	'2021-04-04 01:39:20',	'2021-04-04 01:39:20'),
(12,	'Stocks',	'stocks',	'2021-04-04 01:39:42',	'2021-04-04 01:39:42'),
(13,	'Payments',	'payments',	'2021-04-04 01:40:04',	'2021-04-04 01:40:04'),
(14,	'Payment Modes',	'payment_modes',	'2021-04-04 01:40:36',	'2021-04-04 01:40:36'),
(15,	'Role',	'roles',	'2021-04-07 12:32:18',	'2021-04-07 12:32:18');

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `role_id` int(11) NULL,
  `module_id` int(11) NULL,
  `add` tinyint(1) NULL,
  `edit` tinyint(1) NULL,
  `view` tinyint(1) NULL,
  `delete` tinyint(1) NULL,
  `createdAt` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime NULL,
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE RESTRICT
);