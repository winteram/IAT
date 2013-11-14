<?php

	$id = trim(shell_exec("read -p 'Enter your id: ' id\necho \$id"));
	$password = trim(shell_exec("read -p 'Enter your Password: ' password\necho \$password"));
    $dsn = "mysql:host=localhost";
    $pdo = new PDO($dsn,$id,$password);
    $pdo->query("CREATE USER 'IATexp555'@'%' IDENTIFIED BY '';") or die(print_r($pdo->errorInfo(), true));
    $pdo->query("CREATE DATABASE `IAT555`;") or die(print_r($pdo->errorInfo(), true));
    $pdo->query("USE `IAT555`;") or die(print_r($pdo->errorInfo(), true));
    //$pdo->query("CREATE TABLE Template(Id INT PRIMARY KEY, Name TEXT, TimeStamp TIMESTAMP, ShowResult BINARY, IATtype INT) ENGINE=InnoDB;");
	//$pdo->query("CREATE TABLE Category(Catid INT PRIMARY KEY, Datalabel TEXT, Item VARCHAR, Itemtype VARCHAR, Label VARCHAR) ENGINE=InnoDB;");
	//$pdo->query("CREATE TABLE Item(Itemid INT PRIMARY KEY, Itemname TEXT) ENGINE=InnoDB;");
	//$pdo->query("CREATE TABLE Temp_has_cat(Template_Id INT NOT NULL ,Category_Catid INT NOT NULL ,PRIMARY KEY (Template_Id, Category_Catid)) ENGINE=InnoDB;");
	//$pdo->query("CREATE TABLE Cat_has_item(Category_Catid INT NOT NULL ,Item_Itemid INT NOT NULL ,PRIMARY KEY (Category_Catid, Item_Itemid)) ENGINE=InnoDB;");
	//$pdo->query("CREATE TABLE Results(ResultId INT NOT NULL ,Item_Itemid INT NOT NULL ,PRIMARY KEY (Category_Catid, Item_Itemid)) ENGINE=InnoDB;");
	//$pdo->query("GRANT ALL PRIVILEGES ON * . * TO  'IATexp555'@'%' WITH GRANT OPTION MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0 ;") or die(print_r($pdo->errorInfo(), true));
	//$pdo->query("GRANT ALL PRIVILEGES ON  `IAT555` . * TO  'IATexp555'@'%';") or die(print_r($pdo->errorInfo(), true));
	$pdo->query("CREATE  TABLE `IAT555`.`Template` (
				`TemplateId` INT NOT NULL AUTO_INCREMENT ,
				`TemplateName` TEXT NULL ,
				`TimeStamp` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
				`ShowResult` VARCHAR(45) NULL ,
				`IATtype` VARCHAR(45) NULL ,
				PRIMARY KEY (`TemplateId`))ENGINE = InnoDB;");
	$pdo->query("CREATE  TABLE `IAT555`.`Category` (
  				`CategoryId` INT NOT NULL AUTO_INCREMENT,
  				`CategoryName` VARCHAR(45) NULL ,
  				`DataLabel` VARCHAR(45) NULL ,
  				`ItemType` VARCHAR(45) NULL ,
  				`Label` VARCHAR(45) NULL ,
  				PRIMARY KEY (`CategoryId`)) ENGINE = InnoDB;");	
  	$pdo->query("CREATE  TABLE `IAT555`.`Template_has_category` (
  				`Template_TemplateId` INT NOT NULL ,
  				`Category_CategoryId` INT NOT NULL ,
  				PRIMARY KEY (`Template_TemplateId`, `Category_CategoryId`) )
				ENGINE = InnoDB;");
	$pdo->query("CREATE  TABLE `IAT555`.`Item` (
  				`ItemId` INT NOT NULL AUTO_INCREMENT,
  				`Items` TEXT NULL ,
  				PRIMARY KEY (`ItemId`) ) ENGINE = InnoDB;");
	$pdo->query("CREATE  TABLE `IAT555`.`Category_has_item` (
  				`Category_CategoryId` INT NOT NULL ,
  				`Item_ItemId` INT NOT NULL ,
  				PRIMARY KEY (`Category_CategoryId`, `Item_ItemId`)) ENGINE = InnoDB;");
	$pdo->query("CREATE  TABLE IF NOT EXISTS `IAT555`.`Result` (
  				`ResultId` INT NOT NULL AUTO_INCREMENT,
  				`TemplateId` INT NOT NULL ,
  				`TemplateName` TEXT NULL ,
  				`Blocki` INT NULL ,
  				`Trialj` INT NULL ,
  				`Category` VARCHAR(45) NULL ,
  				`ItemIndex` VARCHAR(45) NULL ,
  				`Errors` VARCHAR(45) NULL ,
  				`MSeconds` VARCHAR(45) NULL ,
  				`TimeStamp` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  ,
  				`User` VARCHAR(45) NULL ,
  				PRIMARY KEY (`ResultId`) )ENGINE = InnoDB;");
				
	$pdo->query("GRANT ALL PRIVILEGES ON * . * TO  'IATexp555'@'%' WITH GRANT OPTION MAX_QUERIES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 MAX_USER_CONNECTIONS 0 ;") or die(print_r($pdo->errorInfo(), true));
	$pdo->query("GRANT ALL PRIVILEGES ON  `IAT555` . * TO  'IATexp555'@'%';") or die(print_r($pdo->errorInfo(), true));


?>
	

