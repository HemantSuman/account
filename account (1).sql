ALTER TABLE `accounts`
ADD `pan_no` varchar(20) COLLATE 'latin1_swedish_ci' NULL AFTER `ifsc`,
ADD `registration_no` varchar(100) COLLATE 'latin1_swedish_ci' NULL AFTER `pan_no`;

