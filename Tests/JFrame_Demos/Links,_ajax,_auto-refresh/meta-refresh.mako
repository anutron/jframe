<!DOCTYPE html>
<html>
  <head>
    <title>Meta Refresh</title>
    <meta http-equiv="refresh" content="5;${request_path}&delay=2" />
    <style>
      .jframe-resume_refresh {
        display:none;
      }
      .auto-refresh-paused .jframe-resume_refresh {
        display: inline;
      }
      .auto-refresh-paused .jframe-pause_refresh {
        display: none;
      }
    </style>
  </head>
  <body>
    <div class="jframe_padded">
      <p>note: this view will auto refresh in <span class="sec_to_autorefresh"></span> seconds</p>
      <p><a class="jframe-pause_refresh">pause</a>
         <a class="jframe-resume_refresh">resume</a></p>
    </div>
  </body>
</html>
