# ppc

The companion tool for Fixwick. It fetches Take It Home Jobs, runs their pytest suites on your computer, and hands the results in to your account.

Install it from the course site (the Job page shows the exact line):

    pip install https://<the course site>/ppc.zip

Then:

    ppc login            sign in: shows a code to type on the site
    ppc get <job-id>     download a Job's starter project into this folder
    ppc check            in a project folder: run the tests, send the results and the code
    ppc submit           the same, but only sends when everything passes
    ppc status           who you're signed in as, and where
    ppc logout           forget the sign-in on this computer

It uses only the Python standard library. The project's own requirements (pytest among them) are installed in the project's virtual environment, as its README explains.

Your sign-in is kept in a file only you can read: `~/.config/ppc/config.json` (on Windows, `%APPDATA%\ppc\config.json`). Disconnect it from the site at any time in Settings, under Connections.
