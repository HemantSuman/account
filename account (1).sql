ALTER TABLE `purchases`
CHANGE `createdAt` `createdAt` date NULL AFTER `payment_remaining`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `accounts`
CHANGE `createdAt` `createdAt` date NULL AFTER `status`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `brands`
CHANGE `createdAt` `createdAt` date NULL AFTER `name`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `categories`
CHANGE `createdAt` `createdAt` date NULL AFTER `slug`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `cities`
CHANGE `createdAt` `createdAt` date NULL AFTER `name`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `companies`
CHANGE `createdAt` `createdAt` date NULL AFTER `status`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `finished_items`
CHANGE `createdAt` `createdAt` date NULL AFTER `quantity`,
CHANGE `updatedAt` `updatedAt` date NOT NULL AFTER `createdAt`;
ALTER TABLE `groups`
CHANGE `createdAt` `createdAt` date NULL AFTER `name`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `invoices`
CHANGE `createdAt` `createdAt` date NULL AFTER `payment_remaining`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `items`
CHANGE `createdAt` `createdAt` date NULL AFTER `status`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `modules`
CHANGE `createdAt` `createdAt` date NULL AFTER `slug`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `other_taxes`
CHANGE `createdAt` `createdAt` date NULL AFTER `percentage`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `payments`
CHANGE `createdAt` `createdAt` date NULL AFTER `remark`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `payments_received`
CHANGE `createdAt` `createdAt` date NULL AFTER `remark`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `payments_received_invoices`
CHANGE `createdAt` `createdAt` date NULL AFTER `pay_amount`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `payment_modes`
CHANGE `createdAt` `createdAt` date NULL AFTER `name`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `payment_purchases`
CHANGE `createdAt` `createdAt` date NULL AFTER `pay_amount`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `permissions`
CHANGE `createdAt` `createdAt` date NULL AFTER `delete`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `productions`
CHANGE `createdAt` `createdAt` date NULL AFTER `status`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `purchase_items`
CHANGE `createdAt` `createdAt` date NULL AFTER `gst`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `roles`
CHANGE `createdAt` `createdAt` date NULL AFTER `slug`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `states`
CHANGE `createdAt` `createdAt` date NULL AFTER `code`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `stocks`
CHANGE `createdAt` `createdAt` date NULL AFTER `type`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `sub_items`
CHANGE `createdAt` `createdAt` date NULL AFTER `size_case`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `taxes`
CHANGE `createdAt` `createdAt` date NULL AFTER `percentage`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `units`
CHANGE `createdAt` `createdAt` date NULL AFTER `name`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;
ALTER TABLE `users`
CHANGE `createdAt` `createdAt` date NULL AFTER `status`,
CHANGE `updatedAt` `updatedAt` date NULL AFTER `createdAt`;


INSERT INTO `modules` (`name`, `slug`, `createdAt`, `updatedAt`)
VALUES ('Users', 'users', now(), now());