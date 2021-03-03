ALTER TABLE `purchases`
ADD `total_value` varchar(50) COLLATE 'latin1_swedish_ci' NULL AFTER `tcs`;


ALTER TABLE `invoices`
DROP `trading_invoice`,
DROP `cgst`,
DROP `igst`,
DROP `sgst`;

ALTER TABLE `invoice_items`
DROP `per`;

ALTER TABLE `purchases`
ADD `cgst_amount` varchar(100) COLLATE 'latin1_swedish_ci' NULL AFTER `taxable_value`,
ADD `igst_amount` varchar(100) COLLATE 'latin1_swedish_ci' NULL AFTER `cgst_amount`,
ADD `sgst_amount` varchar(100) COLLATE 'latin1_swedish_ci' NULL AFTER `igst_amount`,
DROP `gst_amt`;

CREATE TABLE `other_taxes` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `tax_id` int(11) NULL,
  `purchase_id` int(11) NULL,
  `invoice_id` int(11) NULL,
  `createdAt` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL,
  FOREIGN KEY (`tax_id`) REFERENCES `taxes` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE RESTRICT
);

ALTER TABLE `other_taxes`
CHANGE `createdAt` `createdAt` datetime NULL ON UPDATE CURRENT_TIMESTAMP AFTER `invoice_id`,
CHANGE `updatedAt` `updatedAt` datetime NULL AFTER `createdAt`;

INSERT INTO `users` (`id`, `email`, `password`, `first_name`, `last_name`, `status`, `createdAt`, `updatedAt`) VALUES
(2,	'test-11@yopmail.com',	'$2b$10$jfwGb5PRkibP.8qSWI1olubZAE5PYGsKuPMFrtCxR2ZkvcDcrj1Iy',	'test',	'test',	'active',	'2021-02-05 13:01:01',	'2021-02-05 13:01:01');
