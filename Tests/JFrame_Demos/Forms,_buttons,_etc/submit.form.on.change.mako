<!DOCTYPE html>
<html>
	<head>
		<title>Submit Form on Change</title>
	</head>
	<body>
		% if post_vars:
			<div class="jframe_padded">
				You submitted the following values:
				<ul>
					% for post_var, val in post_vars:
					 <li>${post_var}: ${val}</li>
					% endfor
				</ul>
			</div>
			<hr/>
		% endif
		<p>
			The form below will submit as soon as you select a value.
		</p>
		<form action="?project=jframe_demos&path=/Forms,_buttons,_etc/submit.form.on.change.mako" method="post" style="margin: 6px 0px 0px;" data-filters="SubmitOnChange">
			<select name="select_list">
				<option value="option 1">option 1</option>
				<option value="option 2">option 2</option>
				<option value="option 3">option 3</option>
			</select>
			<input type="submit" class="jframe-hidden" name="submit"/>
		</form>
		
		<hr/>
		<p>This form works exactly as the one above, but the SubmitOnChange data filter is on the select, rather than the form.</p>
		<form action="?project=jframe_demos&path=/Forms,_buttons,_etc/submit.form.on.change.mako" method="post" style="margin: 6px 0px 0px;">
			<select name="select_list" data-filters="SubmitOnChange">
				<option value="option 1">option 1</option>
				<option value="option 2">option 2</option>
				<option value="option 3">option 3</option>
			</select>
			<input type="text" name="textinput" value="If you change me, I don't submit the form.">
			<input type="submit" class="jframe-hidden" name="submit"/>
		</form>
	</body>
</html>
