@echo off
echo Starting Chrome in Unsafe Mode (For SyncWatch Testing)...
echo WARNING: Do not use this mode for banking/passwords!

"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\ChromeDevSession" --disable-site-isolation-trials --bwsi http://hyperdev.online/syncwatch/
pause
