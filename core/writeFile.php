<?php
session_start();
$base_dir = realpath(dirname(__FILE__));

$folder_dir = "../output/";

$sub = isset( $_REQUEST['subject'] ) ? $_REQUEST['subject'] : 'unknown2' ;
$src = isset( $_REQUEST['src'] ) ? $_REQUEST['src'] : 'HUH' ;

$data = $_REQUEST["data"]; $randtxt = date('Y-m-d-H-s-');
$fh = fopen($folder_dir. $src . "_" . $sub . '-' . $randtxt . '.txt', 'w');
fwrite($fh, $data);
fclose($fh);
?>
