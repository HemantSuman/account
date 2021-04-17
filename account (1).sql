ALTER TABLE `accounts`
ADD `company_id` int(11) NULL AFTER `group_id`,
ADD FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT;

ALTER TABLE `groups`
ADD `company_id` int(11) NULL AFTER `name`,
ADD FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT;

ALTER TABLE `brands`
ADD `company_id` int(11) NULL AFTER `name`,
ADD FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT;

ALTER TABLE `items`
ADD `company_id` int(11) NULL AFTER `category_id`,
ADD FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT;

ALTER TABLE `sub_items`
ADD `company_id` int(11) NULL AFTER `item_id`,
ADD FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT;

ALTER TABLE `invoices`
ADD `company_id` int(11) NULL AFTER `buyer`,
ADD FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT;

ALTER TABLE `purchases`
ADD `company_id` int(11) NULL AFTER `account_id`,
ADD FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT;

ALTER TABLE `productions`
ADD `company_id` int(11) NULL AFTER `sub_item_id`,
ADD FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT;

ALTER TABLE `purchase_items`
ADD `company_id` int(11) NULL AFTER `sub_item_id`,
ADD FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT;

ALTER TABLE `payments`
ADD `company_id` int(11) NULL AFTER `account_id`,
ADD FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT;

ALTER TABLE `payment_purchases`
ADD `company_id` int(11) NULL AFTER `purchase_id`,
ADD FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE RESTRICT;

