ALTER TABLE `other_taxes`
ADD `percentage` varchar(50) NULL AFTER `invoice_id`;

ALTER TABLE `invoices`
CHANGE `consignee_no` `consignee_no` int(11) NULL AFTER `date`,
CHANGE `buyer` `buyer` int(11) NULL AFTER `consignee_no`,
ADD FOREIGN KEY (`consignee_no`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT,
ADD FOREIGN KEY (`buyer`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT;


ALTER TABLE `invoice_items`
ADD `type` varchar(20) COLLATE 'latin1_swedish_ci' NULL AFTER `id`;