
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(200) NULL,
  `slug` varchar(200) NULL,
  `createdAt` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime NULL
);

CREATE TABLE `modules` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(200) NULL,
  `slug` varchar(200) NULL,
  `createdAt` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime NULL
);

CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `purchase_id` int(11) DEFAULT NULL,
  `pay_date` date NOT NULL,
  `pay_mode` varchar(100) DEFAULT NULL,
  `pay_amount` varchar(100) DEFAULT NULL,
  `remark` varchar(500) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `purchase_id` (`purchase_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`)
);

ALTER TABLE `payments`
ADD `account_id` int(11) NULL AFTER `purchase_id`,
ADD FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT;

ALTER TABLE `purchases`
ADD `payment_status` varchar(50) COLLATE 'latin1_swedish_ci' NULL AFTER `total_value`;

ALTER TABLE `purchases`
CHANGE `payment_status` `payment_status` varchar(50) COLLATE 'latin1_swedish_ci' NULL DEFAULT 'initial' AFTER `total_value`;

update purchases set payment_status = 'initial';

ALTER TABLE `invoice_items`
ADD `gst` int(11) NULL AFTER `rate`;

ALTER TABLE `invoice_items`
ADD `gst_amount` int(11) NULL AFTER `gst`;

ALTER TABLE `invoices`
ADD `total_GST` varchar(500) COLLATE 'latin1_swedish_ci' NULL AFTER `sgst_amount`;

ALTER TABLE `companies`
DROP FOREIGN KEY `companies_ibfk_2`

ALTER TABLE `companies`
CHANGE `city_id` `city` varchar(50) NULL AFTER `state_id`;

ALTER TABLE `accounts`
DROP FOREIGN KEY `accounts_ibfk_2`

ALTER TABLE `accounts`
CHANGE `city_id` `city` varchar(50) NULL AFTER `state_id`;