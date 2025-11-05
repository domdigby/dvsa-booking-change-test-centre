# DVSA Practical Driving Test - Change Test Centre
This is a Javascript which will run in your browser, to automate the repeated search for available test slots at the test centres near to the post code you enter.

The current system to book a practical driving test is woeful.  Weeks spent searching with the same response - "No tests available on any date".  The Monday morning release of new slots is accompanied by an hours long wait in a queue, only to find either no slots avaialble or only 300 miles from where you live, in 4 months time.  So you grab that slot (buggering the system even more for those who actually live near that test centre and wanted that slot). Utterly useless.

So now you have a slot, in the wrong test centre, this script will automate your search to change test centre. It is Javascript which runs in your broswer.

# Features

* Automated navigation through the DVSA driving test change booking site
* Filling in driving license details, booking reference, postcode and test sites to check
* Searching for test centres nearest to the postcode
* For the test centres found, checks those you have specified for available slots and keeps repeating the search if none available.
* Delays the repeat search to avoid hitting the hourly rate limit (3 mins between searches).
* Toast notifications for visual feedback including countdown to next search and pop-up if slot is found.
* Alert sound for audio feedback if slot is found.
* Button to pause / reume the search.

# Pre-Requisites

* You already need a practical test booked.  If you don't have one, see this script for getting one:
[DVSA Driving Test Booking Automation](https://github.com/jethro-dev/dvsa-driving-test-booking-automation).
* **Do not use Chrome as your browser.**  I use Firefox but Edge or other browsers may work too, just not Chrome (DVSA security thinks it is a bot and will block it).
* Use Private or Incognito mode in the browser.
* Tampermonkey extension installed in the browser [Firefox Extension - Tampermonkey](https://addons.mozilla.org/en-GB/firefox/addon/tampermonkey/)

# Installation

* Configure Tampermonkey extension.  Click on the extension icon in the browser and select "Create a new script".
* Copy and paste main.js to Tampermonkey editor.  
* Edit the placeholder text in the script, replacing it with your specific details - see the block of code below:
    * Add your driving licence identification number between the double quotes.
    * Add your existing booking reference between the double quotes.
    * Add your postcode to search for test centres closest to, between the double quotes.
    * Add the names of the target test centres that will be in the top 5 from the postcode search, between the double quotes.  In the example code, I have only added 2 but you can add more, just seratae them with commas.
    ```
        const CONFIG = {
        license: "ENTER YOUR DRIVER LICENCE ID HERE",
        bookingRef: "ENTER YOUR BOOKING REF HERE",
        postcode: "ENTER YOUR POST CODE HERE",
        waitMinutes: 3,
        targetCentres: ["ENTER TEST CENTRE NAME HERE", "ENTER ANOTHER TEST CENTRE NAME HERE"]
    };
    ```
* In the Tampermonkey Editor, click File > Save.
* Make sure the Tampermonkey script is enabled - Open Tampermonkey extension, go to Dashboard and toggle on the script (should be green).

# How to Use

1. In Firefox Private browser mode, go to [DVSA Change Driving Test](https://www.gov.uk/change-driving-test).
2. Click on *Start Now* button.  The script will start running and you will see the status of the search appear.
3. At the security screen (I am not a bot check) you will need to manually click on the various images to prove you are not R2D2 or Metal Micky (a bot).  Once done, the script will take over.
4. Every 3 mins, it will repeat the search if no available slots are found at your target test centres.  If a slot is found, it will alert you.
5. Intermittently, the security screen may reappear.  When it does, click the images to prove you are still not a bot and the script will continue again.

# Disclaimer

* Use at your discretion.  It is not perfect but helps avoid paying for an app that does the same thing (and is not authorised to do so by DVSA).
* I disclaim all association with this dire system.
