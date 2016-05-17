#! /bin/bash

MYSQL=`which mysql`

if [ ${#MYSQL} -lt "5" ]; then
	echo "No MySQL found"
	exit 1
fi

Q1="CREATE DATABASE IF NOT EXISTS IAT555 CHARACTER SET utf8 COLLATE utf8_unicode_ci;"
Q2="CREATE USER 'IATexp555'@'localhost' IDENTIFIED BY 'myIAT';"
Q3="GRANT ALL ON IAT555.* TO 'IATexp555'@'localhost';"
Q4="FLUSH PRIVILEGES;"

Q5="USE IAT555;"


T1="CREATE TABLE IAT555.Template (
				TemplateId INT NOT NULL AUTO_INCREMENT ,
				TemplateName TEXT NULL ,
				TimeStamp TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
				ShowResult VARCHAR(45) NULL ,
				IATtype VARCHAR(45) NULL ,
				PRIMARY KEY (TemplateId))ENGINE = InnoDB;"
T2="CREATE TABLE IAT555.Category (
  				CategoryId INT NOT NULL AUTO_INCREMENT,
  				CategoryName VARCHAR(45) NULL ,
  				DataLabel VARCHAR(45) NULL ,
  				ItemType VARCHAR(45) NULL ,
  				Label VARCHAR(45) NULL ,
  				PRIMARY KEY (CategoryId)) ENGINE = InnoDB;"
T3="CREATE  TABLE IAT555.Template_has_category (
  				Template_TemplateId INT NOT NULL ,
  				Category_CategoryId INT NOT NULL ,
  				PRIMARY KEY (Template_TemplateId, Category_CategoryId) )
				ENGINE = InnoDB;"
T4="CREATE  TABLE IAT555.Item (
  				ItemId INT NOT NULL AUTO_INCREMENT,
  				Items TEXT NULL ,
  				PRIMARY KEY (ItemId) ) ENGINE = InnoDB;"
T5="CREATE  TABLE IAT555.Category_has_item (
  				Category_CategoryId INT NOT NULL ,
  				Item_ItemId INT NOT NULL ,
  				PRIMARY KEY (Category_CategoryId, Item_ItemId)) ENGINE = InnoDB;"
T6="CREATE  TABLE IF NOT EXISTS IAT555.Result (
  				ResultId INT NOT NULL AUTO_INCREMENT,
  				TemplateId INT NOT NULL ,
  				TemplateName TEXT NULL ,
  				Blocki INT NULL ,
  				Trialj INT NULL ,
  				Category VARCHAR(45) NULL ,
  				ItemIndex VARCHAR(45) NULL ,
  				Errors VARCHAR(45) NULL ,
  				MSeconds VARCHAR(45) NULL ,
  				TimeStamp TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  ,
  				User VARCHAR(45) NULL ,
  				PRIMARY KEY (ResultId) )ENGINE = InnoDB;"


SQL="${Q1}${Q2}${Q3}${Q4}${Q5}${T1}${T2}${T3}${T4}${T5}${T6}"
$MYSQL -uroot -p -e "$SQL"

echo "Database and tables created.  Success!"