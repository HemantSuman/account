CREATE TABLE `payment_purchases` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `payment_id` int(11) NULL,
  `purchase_id` int(11) NULL,
  `createdAt` datetime NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime NULL,
  FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE RESTRICT
);

ALTER TABLE `payment_purchases`
ADD `pay_amount` varchar(250) NULL AFTER `purchase_id`;


ALTER TABLE `purchases`
ADD `payment_remaining` varchar(100) COLLATE 'latin1_swedish_ci' NULL AFTER `payment_status`;


UPDATE `purchases` SET `payment_remaining` = total_value;