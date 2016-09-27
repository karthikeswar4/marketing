<?php

Class Autoload {
	
	protected static $instance;
	protected static $logger;
	protected $root_dir;
	protected $classes;
	
	public function load($classname) {
		if (array_key_exists($classname, $this->classes)) {
			require_once($this->root_dir.$this->classes[$classname]['path']);
		}
	}
	
	public static function getInstance() {
		 if (empty(self::$instance) || !isset(self::$instance)) {
            self::$instance = new Autoload();
	        spl_autoload_register(array(self::$instance, 'load'));
            self::$logger = Logger::getLogger("Autoload");
        }
        return self::$instance;
	}
	
	/**
	 * recursively create a long directory path
	 */
	function createPath($path) {
		if (is_dir($path)) return true;
		$path = str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $path);
		$path = rtrim($path, DIRECTORY_SEPARATOR);
		$paths = explode(DIRECTORY_SEPARATOR, $path);
		$lastIndex = sizeof($paths) - 1;
		$cPath = $this->root_dir;
		$index = 0;
		foreach ($paths as $key => $value) {
			if ($index == $lastIndex && strpos($value, ".") !== false) return;
			$cPath = $cPath.DIRECTORY_SEPARATOR.$value;
			if (!is_file($cPath) && !file_exists($cPath)) {
				mkdir($cPath);
			}
			$index++;
		}
	}
	
	protected function __construct() {
        $this->root_dir = dirname(__FILE__);        
        $cacheFileFullPath = $this->root_dir.DIRECTORY_SEPARATOR.CACHE_FILE;
        if (file_exists($cacheFileFullPath)) {
        	 try {
		        $str = file_get_contents($cacheFileFullPath);
		        $this->classes = unserialize($str);
	    	    return;
        	 } catch(Exception $e) {
        	 	self::$logger->error("error reading cache", $e);
        	 }
        } else {
        	$this->createPath(CACHE_FILE);
        }
        
		$appclasses = $this->getClassesFromDir('/');
		$libclasses = $this->getClassesFromDir('/../phplibs/');
		$this->classes = array_merge($appclasses, $libclasses);
				
		$fh = fopen($cacheFileFullPath, 'w');
		fwrite($fh, serialize($this->classes));
		fclose($fh);
    }
	
	protected function getClassesFromDir($path, $host_mode = false) {
	
		$classes = array();
		$root_dir = $host_mode ? $this->normalizeDirectory(_PS_ROOT_DIR_) : $this->root_dir;
			
		foreach (scandir($root_dir.$path) as $file) {
			if ($file[0] != '.') {
				if (is_dir($root_dir.$path.$file)) {
					$classes = array_merge($classes, $this->getClassesFromDir($path.$file.'/', $host_mode));
				} elseif (substr($file, -4) == '.php') {
					$content = file_get_contents($root_dir.$path.$file);

					$namespacePattern = '[\\a-z0-9_]*[\\]';
					$pattern = '#\W((abstract\s+)?class|interface)\s+(?P<classname>'.basename($file, '.php').'?)'
								.'(?:\s+extends\s+'.$namespacePattern.'[a-z][a-z0-9_]*)?(?:\s+implements\s+'.$namespacePattern.'[a-z][\\a-z0-9_]*(?:\s*,\s*'.$namespacePattern.'[a-z][\\a-z0-9_]*)*)?\s*\{#i';
					if (preg_match($pattern, $content, $m)) {
						
						$classes[$m['classname']] = array(
							'path' => $path.$file,
							'type' => trim($m[1]),
							'override' => $host_mode
						);
					}
				}
			}
		}
		return $classes;
	}

	private function normalizeDirectory($directory) {
		return rtrim($directory, '/\\').DIRECTORY_SEPARATOR;
	}
}

if (!defined("BASE_DIR")) {
	define("BASE_DIR", dirname(__FILE__));
	define("CACHE_FILE", "cache".DIRECTORY_SEPARATOR."cache.txt");
}

Autoload::getInstance();

?>