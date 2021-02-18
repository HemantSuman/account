-- Adminer 4.7.6 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) DEFAULT NULL,
  `code` int(11) DEFAULT NULL,
  `account_name` varchar(500) DEFAULT NULL,
  `address` varchar(250) DEFAULT NULL,
  `state_id` int(11) DEFAULT NULL,
  `city_id` int(11) DEFAULT NULL,
  `pin` varchar(6) DEFAULT NULL,
  `gstin` varchar(200) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `mobile1` varchar(12) DEFAULT NULL,
  `mobile2` varchar(12) DEFAULT NULL,
  `bank_name` varchar(200) DEFAULT NULL,
  `ac_no` varchar(200) DEFAULT NULL,
  `ifsc` varchar(200) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `state_id` (`state_id`),
  KEY `city_id` (`city_id`),
  CONSTRAINT `accounts_ibfk_1` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`),
  CONSTRAINT `accounts_ibfk_2` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `cities`;
CREATE TABLE `cities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `state_id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `state_id` (`state_id`),
  CONSTRAINT `cities_ibfk_1` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `state_id` int(11) DEFAULT NULL,
  `city_id` int(11) DEFAULT NULL,
  `pin` varchar(10) DEFAULT NULL,
  `gstin` varchar(500) DEFAULT NULL,
  `cin` varchar(50) DEFAULT NULL,
  `pan_no` varchar(50) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '0',
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `state_id` (`state_id`),
  KEY `city_id` (`city_id`),
  CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`),
  CONSTRAINT `companies_ibfk_2` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `finished_items`;
CREATE TABLE `finished_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) DEFAULT NULL,
  `finished_item_id` int(11) DEFAULT NULL,
  `unit` int(11) DEFAULT NULL,
  `quantity` varchar(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `item_id` (`item_id`),
  KEY `finished_item_id` (`finished_item_id`),
  KEY `unit` (`unit`),
  CONSTRAINT `finished_items_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `finished_items_ibfk_2` FOREIGN KEY (`finished_item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `finished_items_ibfk_3` FOREIGN KEY (`unit`) REFERENCES `units` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `groups`;
CREATE TABLE `groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(500) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_no` varchar(500) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `consignee_no` varchar(500) DEFAULT NULL,
  `buyer` varchar(500) DEFAULT NULL,
  `buyer_add` varchar(500) DEFAULT NULL,
  `challan_no` varchar(500) DEFAULT NULL,
  `challan_date` varchar(500) DEFAULT NULL,
  `time_of_remeber` varchar(500) DEFAULT NULL,
  `order_no` varchar(500) DEFAULT NULL,
  `order_date` varchar(500) DEFAULT NULL,
  `transaction_mode` varchar(500) DEFAULT NULL,
  `dispach_through` varchar(500) DEFAULT NULL,
  `delivery_at` varchar(500) DEFAULT NULL,
  `vehicle_no` varchar(500) DEFAULT NULL,
  `rr_gr_no` varchar(500) DEFAULT NULL,
  `rr_date` date DEFAULT NULL,
  `freight` varchar(500) DEFAULT NULL,
  `pay_by` varchar(500) DEFAULT NULL,
  `trading_invoice` varchar(500) DEFAULT NULL,
  `payment_terms` varchar(500) DEFAULT NULL,
  `sub_total` varchar(500) DEFAULT NULL,
  `discount` varchar(500) DEFAULT NULL,
  `amount` varchar(500) DEFAULT NULL,
  `transportation` varchar(500) DEFAULT NULL,
  `cgst` varchar(500) DEFAULT NULL,
  `cgst_amount` varchar(500) DEFAULT NULL,
  `igst` varchar(500) DEFAULT NULL,
  `igst_amount` varchar(500) DEFAULT NULL,
  `sgst` varchar(500) DEFAULT NULL,
  `sgst_amount` varchar(500) DEFAULT NULL,
  `net_amount` varchar(500) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `invoice_items`;
CREATE TABLE `invoice_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invoice_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `sub_item_id` int(11) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `no_of_pkg` varchar(100) DEFAULT NULL,
  `unit` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `rate` int(11) DEFAULT NULL,
  `per` varchar(100) DEFAULT NULL,
  `amount` int(11) DEFAULT NULL,
  `createdAt` date DEFAULT NULL,
  `updatedAt` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `item_id` (`item_id`),
  KEY `sub_item_id` (`sub_item_id`),
  KEY `unit` (`unit`),
  KEY `invoice_id` (`invoice_id`),
  CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `invoice_items_ibfk_2` FOREIGN KEY (`sub_item_id`) REFERENCES `sub_items` (`id`),
  CONSTRAINT `invoice_items_ibfk_3` FOREIGN KEY (`unit`) REFERENCES `units` (`id`),
  CONSTRAINT `invoice_items_ibfk_4` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `items`;
CREATE TABLE `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) DEFAULT NULL,
  `item_name` varchar(500) DEFAULT NULL,
  `item_code` varchar(500) DEFAULT NULL,
  `hsn_code` varchar(500) DEFAULT NULL,
  `unit` varchar(500) DEFAULT NULL,
  `wastage` varchar(500) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '0',
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `productions`;
CREATE TABLE `productions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) DEFAULT NULL,
  `sub_item_id` int(11) DEFAULT NULL,
  `brand_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `date_of_production` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `item_id` (`item_id`),
  KEY `sub_item_id` (`sub_item_id`),
  KEY `brand_id` (`brand_id`),
  CONSTRAINT `productions_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `productions_ibfk_2` FOREIGN KEY (`sub_item_id`) REFERENCES `sub_items` (`id`),
  CONSTRAINT `productions_ibfk_3` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `purchases`;
CREATE TABLE `purchases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) DEFAULT NULL,
  `purchase_invoice_no` varchar(100) DEFAULT NULL,
  `purchase_invoice_date` date DEFAULT NULL,
  `frieght_type` varchar(200) DEFAULT NULL,
  `mode_of_transport` varchar(200) DEFAULT NULL,
  `vehicle_no` varchar(50) DEFAULT NULL,
  `dispatched_through` varchar(250) DEFAULT NULL,
  `term_of_payment` varchar(50) DEFAULT NULL,
  `to_be_pay_upto_date` date DEFAULT NULL,
  `pay_date` date DEFAULT NULL,
  `pay_amount` varchar(100) DEFAULT NULL,
  `pay_mode` varchar(100) DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL,
  `settlement` varchar(100) DEFAULT NULL,
  `discount` varchar(100) DEFAULT NULL,
  `taxable_value` varchar(100) DEFAULT NULL,
  `gst_amt` varchar(100) DEFAULT NULL,
  `tcs` varchar(100) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `purchase_items`;
CREATE TABLE `purchase_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `purchase_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `sub_item_id` int(11) DEFAULT NULL,
  `no_of_pkg` varchar(250) DEFAULT NULL,
  `quantity` varchar(50) DEFAULT NULL,
  `rate` varchar(20) DEFAULT NULL,
  `gst` varchar(20) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `purchase_id` (`purchase_id`),
  KEY `item_id` (`item_id`),
  KEY `sub_item_id` (`sub_item_id`),
  CONSTRAINT `purchase_items_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  CONSTRAINT `purchase_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `purchase_items_ibfk_3` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  CONSTRAINT `purchase_items_ibfk_4` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `purchase_items_ibfk_5` FOREIGN KEY (`sub_item_id`) REFERENCES `sub_items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `states`;
CREATE TABLE `states` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `code` varchar(10) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `stocks`;
CREATE TABLE `stocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) DEFAULT NULL,
  `sub_item_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `no_of_pkg` varchar(100) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `item_id` (`item_id`),
  KEY `sub_item_id` (`sub_item_id`),
  CONSTRAINT `stocks_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `stocks_ibfk_5` FOREIGN KEY (`sub_item_id`) REFERENCES `sub_items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `sub_items`;
CREATE TABLE `sub_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) DEFAULT NULL,
  `code` varchar(200) DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL,
  `size_pkt` varchar(50) DEFAULT NULL,
  `size_case` varchar(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `sub_items_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `taxes`;
CREATE TABLE `taxes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(250) DEFAULT NULL,
  `percentage` varchar(100) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `units`;
CREATE TABLE `units` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(10) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(250) DEFAULT NULL,
  `password` varchar(500) DEFAULT NULL,
  `first_name` varchar(200) DEFAULT NULL,
  `last_name` varchar(200) DEFAULT NULL,
  `status` varchar(10) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- 2021-02-18 07:46:08
