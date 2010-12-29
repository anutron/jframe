<!DOCTYPE html>
<html>
	<head>
		<title>Refresh with params</title>
	</head>
	<body>
		<div class="jframe_padded">
			<p>clicking the two links below will update the view to have their corresponding get parameters added. This is cumulative, so clicking each one only updates the relevant param (not deleting others)</p>
			<a class="jframe-refresh_with_params" data-refresh-params="iLike=cookies">I refresh this view with "iLike=cookies"</a><br/>
			<a class="jframe-refresh_with_params" data-refresh-params="iLike=cake">I refresh this view with "iLike=cake"</a><br/>
			<a class="jframe-refresh_with_params" data-refresh-params="youLike=cookies">I refresh this view with "youLike=cookies"</a><br/>
			<a class="jframe-refresh_with_params" data-refresh-params="youLike=cake">I refresh this view with "youLike=cake"</a><br/>
			<hr/>
			the current values: <br/>
			iLike: ${ get_var("iLike", "~")}<br/>
			youLike: ${ get_var("youLike", "~")}<br/>
		</div>
	</body>
</html>
