% if post_vars:
  <!-- test_runner_no_wrapper -->
  <div class="border_div" style="border: 1px solid #000; background: #999; padding: 10px;">
    <div class="jframe_padded">
      You submitted the following values:
      <ul>
        % for post_var, val in post_vars:
         <li>${post_var}: ${val}</li>
        % endfor
      </ul>
    </div>
  </div>
% else:


<h2>Simple form that refreshes entire view</h2>
<form method="post" style="margin: 6px 0px 0px;">
  enter a value: <input type="text" name="prompt_value" value="Some text"/>
  <input type="submit" name="submit"/>
</form>

<hr/>
<h2>Form that updates its parent</h2>
<div style="border: 1px solid #000; padding: 10px; margin: 10px 0px; max-height: 100px; overflow:auto;">
  <p>This text will <em>NOT</em> remain when the form below replaces itself.</p>
  <form method="post" style="margin: 6px 0px 0px;" data-ajax-target="parent">
    enter a value: <input type="text" name="prompt_value" value="Some text"/>
    <input type="submit" name="submit"/>
  </form>
</div>

<hr/>
<h2>Form that updates itself</h2>
<div style="border: 1px solid #000; padding: 10px; margin: 10px 0px; max-height: 100px; overflow:auto;">
  <p>This text will remain when the form below replaces itself.</p>
  <form method="post" style="margin: 6px 0px 0px;" data-ajax-target="self">
    enter a value: <input type="text" name="prompt_value" value="Some text"/>
    <input type="submit" name="submit"/>
  </form>
</div>

<hr/>
<h2>Form that updates by selector</h2>
<form method="post" style="margin: 6px 0px 0px;" data-ajax-target=".ajax_form_target_by_selector">
  enter a value: <input type="text" name="prompt_value" value="Some text"/>
  <input type="submit" name="submit"/>
</form>
<div style="border: 1px solid #000; padding: 10px; margin: 10px 0px; max-height: 100px; overflow:auto;">
  <div class="ajax_form_target_by_selector">
  </div>
</div>
<hr/>
<h2>Form that updates with a filter</h2>
<p>This example will replace the target below but will NOT have a double border.</p>
<form method="post" style="margin: 6px 0px 0px;" data-ajax-target=".ajax_form_target_with_filter" data-ajax-filter=".jframe_padded">
  enter a value: <input type="text" name="prompt_value" value="Some text"/>
  <input type="submit" name="submit"/>
</form>
<div style="border: 1px solid #000; padding: 10px; margin: 10px 0px; max-height: 100px; overflow:auto;">
  <div class="ajax_form_target_with_filter">
  </div>
</div>

% endif