ALTER TABLE `purchases`
CHANGE `despatched_through` `dispatched_through` varchar(250) COLLATE 'latin1_swedish_ci' NULL AFTER `vehicle_no`;

DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
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


INSERT INTO `brands` (`name`, `createdAt`, `updatedAt`)
VALUES ('Brand A', now(), now());

INSERT INTO `brands` (`name`, `createdAt`, `updatedAt`)
VALUES ('Brand B', now(), now());