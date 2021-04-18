ALTER TABLE `payments_received`
ADD `company_id` int(11) NULL AFTER `account_id`,
ADD FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT;

ALTER TABLE `payments_received_invoices`
ADD `company_id` int(11) NULL AFTER `invoice_id`,
ADD FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT;

ALTER TABLE `stocks`
ADD `company_id` int(11) NULL AFTER `sub_item_id`,
ADD FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT;
