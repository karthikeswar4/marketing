<?php
class ExcelReader {
	
	private $logger;
	function __construct() {
		$excel = new PHPExcel();
		$this->logger = Logger::getLogger("ExcelReader");
	}
	
	/**
	 * @param fullLocation
	 */
	 function getExcelWorkBook($fullLocation) {
	 	try {
			$objPHPExcel = PHPExcel_IOFactory::load($fullLocation);
			$this->logger->info(date('H:i:s')." Iterate worksheets");
			$header = array();
			$sheets = $objPHPExcel->getAllSheets();
			if (count($sheets) > 0) {
				return $sheets[0];
			}
	 	} catch (ValidationException $e) {
	 		throw $e;
	 	} catch (Exception $e) {
	 		$this->logger->error("Error Reading sheet: ".$fullLocation, $e);
	 		throw new ValidationException("Error Reading Sheet");
	 	}
		return null;
	}
	
	/**
	 * @param fullLocation
	 */
	 function readExcelWorkBook($fullLocation, $startRow = 1, $length = 0) {
	 	try {
			$objPHPExcel = PHPExcel_IOFactory::load($fullLocation);
			$this->logger->info(date('H:i:s')." Iterate worksheets");
			$header = array();
			foreach ($objPHPExcel->getWorksheetIterator() as $worksheet) {
				return $this->getWorkSheetRows($worksheet, $startRow, $length, $header);
				break;
			}
	 	} catch (ValidationException $e) {
	 		throw $e;
	 	} catch (Exception $e) {
	 		$this->logger->error("Error Reading sheet: ".$fullLocation, $e);
	 		throw new ValidationException("Error Reading Sheet");
	 	}
		return null;
	}
	
	/**
	 * @param length
	 * @param header
	 */
	 function getWorkSheetRows($worksheet, $startRow = 1, $length = 0) {
	 	
	 	try {
			$this->logger->info('Worksheet - ' . $worksheet->getTitle());
			if ($startRow <= 0) $startRow = 1;
			$rowIndex = 0;
			$rows = array();
			foreach ($worksheet->getRowIterator($startRow) as $row) {
				$this->logger->info('    Row number - ' . $row->getRowIndex());
				$cellIterator = $row->getCellIterator();
				$cellIterator->setIterateOnlyExistingCells(false); // Loop all cells, even if it is not set
				$columns = array();
				foreach ($cellIterator as $cell) {
					if (is_null($cell)) continue;
					$this->logger->info( '        Cell - ' . $cell->getCoordinate() . ' - ' . $cell->getCalculatedValue());
					$columns[] = $cell->getValue();
				}
				
				$rows[] = $columns;
				if ($length > 0 && ++$rowIndex >= $length) {
					break;
				}
			}
			return $rows;
	 	} catch (Exception $e) {
	 		$this->logger->error("Error Reading excel rows", $e);
	 		throw new ValidationException("Error Reading Excel rows");
	 	}
	}

}
?>