@echo off
echo ============================================
echo Module 9 Comprehensive Test Suite
echo ============================================
echo.

echo [1/4] Running Functionality Tests...
call npm test -- module9_functionality.test.js --testTimeout=60000 --runInBand --forceExit
if %errorlevel% neq 0 (
    echo FUNCTIONALITY TESTS FAILED
    exit /b 1
)
echo.

echo [2/4] Running Performance Tests...
call npm test -- module9_performance.test.js --testTimeout=60000 --runInBand --forceExit
if %errorlevel% neq 0 (
    echo PERFORMANCE TESTS FAILED
    exit /b 1
)
echo.

echo [3/4] Running Security Tests...
call npm test -- module9_security.test.js --testTimeout=60000 --runInBand --forceExit
if %errorlevel% neq 0 (
    echo SECURITY TESTS FAILED
    exit /b 1
)
echo.

echo [4/4] Running Integration Tests...
call npm test -- module9_integration.test.js --testTimeout=60000 --runInBand --forceExit
if %errorlevel% neq 0 (
    echo INTEGRATION TESTS FAILED
    exit /b 1
)
echo.

echo ============================================
echo All Module 9 Tests Passed Successfully!
echo ============================================
