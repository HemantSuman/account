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

CREATE TABLE `payments_received` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `invoice_id` int(11) NULL,
  `account_id` int(11) NULL,
  `pay_date` date NOT NULL,
  `pay_mode` varchar(100) NULL,
  `pay_amount` varchar(100) NULL,
  `remark` varchar(500) NULL,
  `createdAt` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime NULL,
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT
);

CREATE TABLE `payments_received_invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `payments_received_id` int(11) NULL,
  `invoice_id` int(11) NULL,
  `pay_amount` varchar(250) NULL,
  `createdAt` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime NULL,
  FOREIGN KEY (`payments_received_id`) REFERENCES `payments_received` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE RESTRICT
);

ALTER TABLE `payments_received`
DROP FOREIGN KEY `payments_received_ibfk_1`

ALTER TABLE `payments_received`
DROP `invoice_id`;

ALTER TABLE `payments`
DROP FOREIGN KEY `payments_ibfk_1`

ALTER TABLE `payments`
DROP `purchase_id`;

INSERT INTO `modules` (`name`, `slug`, `createdAt`, `updatedAt`)
VALUES ('Payment Received', 'payments_received', now(), now());

ALTER TABLE `invoices`
ADD `payment_remaining` varchar(100) COLLATE 'latin1_swedish_ci' NULL AFTER `net_amount`;

ALTER TABLE `invoices`
ADD `payment_status` varchar(50) COLLATE 'latin1_swedish_ci' NULL AFTER `net_amount`;

update `invoices` SET payment_status = 'initial';

update `invoices` SET payment_remaining = net_amount;
