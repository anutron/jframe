<%
  """
  Draws 'pstree' by using output from ps command.

  GET arguments:
    subtree: show only pids below this tree
    show_all: expand the entire tree
    paths: slash-separated paths that are expanded
      (can be specified multiple times)

  """
  import subprocess
  import re
  import urllib

  class PsLine(object):
    def __init__(self, user, pid, ppid, pgid, cputime, command):
      self.user = user
      self.pid = int(pid)
      self.ppid = int(ppid)
      self.pgid = int(pgid)
      self.cputime = cputime
      self.command = command
      self.children = []



  request = get_request()
  
  if request.GET.get('sleep'):
    sleep = int(request.GET.get('sleep'))
    time.sleep(sleep)

  # Call ps
  p = subprocess.Popen(args=["ps", "-axwwo", "user,pid,ppid,pgid,cputime,command"], stdout=subprocess.PIPE)


  children = {}
  first = True
  if "subtree" in request.GET:
    subtree = long(request.GET.get("subtree"))
  else:
    subtree = None
  subtree_top = None

  # Parse in the data
  for row in p.stdout:
    if first:
      # skip header line
      first = False
      continue
    data = user, pid, ppid, pgid, cputime, command = re.split("\s+", row.rstrip(), 5)
    ps = PsLine(*data)
    if ps.pid == subtree:
      subtree_top = ps
    if ps.ppid in children:
      children[ps.ppid].append(ps)
    else:
      children[ps.ppid] = [ps]
  
  # Utility method to create the tree
  def fill(root, current_path):
    root.path = current_path + str(root.pid)
    root.children = children.get(root.pid, [])
    for child in root.children:
      fill(child, root.path + "/")

  # Start with init and create the tree
  # Note that on linux, kthreadd is also a child of pid 0
  top_list = filter(lambda x: 'launchd' in x.command, children[0])
  if (len(top_list) != 1):
    top_list = filter(lambda x: 'initd' in x.command, children[0])
  assert len(top_list) == 1
  top = top_list[0]
  fill(top, "/")
  tops = [top]

  # If we're only interested in a subtree, pick that out explicitly
  if subtree_top:
    tops = subtree_top.children

  def make_path(path, query):
    return join_path(path, "&".join(query))

  def join_path(path, queryString):
    result = str(path)
    if len(queryString) > 0:
      if result.find("?") == -1:
        result += "?"
      else:
        result += "&"
      result += queryString
    return result

  # Methods to manipulate the extant paths list; used by the template.
  def add(p):
    paths = list(request.GET.getlist("paths")) # make a copy
    paths.append(p)
    query = [urllib.urlencode([("paths", x)]) for x in paths]
    if subtree:
      query.append('subtree=' + str(subtree))
    return make_path(request.path, query)
  def remove(p):
    paths = list(request.GET.getlist("paths")) # make a copy
    paths.remove(p)
    query = [urllib.urlencode([("paths", x)]) for x in paths]
    if subtree:
      query.append('subtree=' + str(subtree))
    return make_path(request.path, query)

  paths = request.GET.getlist("paths")
  show_all=request.GET.get("show_all")
  open_paths=paths
  depth=request.GET.get('depth', 0)

%>
<!DOCTYPE html>
<html>
  <head>
    <title>HtmlTable Treeview w/ Ajax</title>
    <style>
    .table-depth-0>td:first-child { padding-left: 10px; }
    .table-depth-1>td:first-child { padding-left: 25px; }
    .table-depth-2>td:first-child { padding-left: 40px; }
    .table-depth-3>td:first-child { padding-left: 55px; }
    .table-depth-4>td:first-child { padding-left: 70px; }
    .table-depth-5>td:first-child { padding-left: 85px; }
    .table-depth-6>td:first-child { padding-left: 100px; }
    .table-depth-7>td:first-child { padding-left: 115px; }
    .table-depth-8>td:first-child { padding-left: 130px; }
    .table-depth-9>td:first-child { padding-left: 145px; }
    .table-depth-10>td:first-child { padding-left: 160px; }
    .table-depth-11>td:first-child { padding-left: 175px; }
    </style>
    <meta http-equiv="refresh" content="5" />
  </head>
  <body>
    % if depth > 1:
      <!-- test_runner_no_wrapper -->
    % endif
    <div class="jframe_padded highlight-partial-updates"> 
      <input value="you can put some text in here to verify that the whole view doesn't refresh" style="width: 500px;"/>
      <table data-filters="HtmlTable" class="selectable treeView" style="border: 1px solid #999; width: 98%">

      <%def name="create_row(node, depth, path)">
        <%
          expanded = ""
          if path in open_paths:
            expanded = "table-expanded"
          folder = ""
          if node.children:
            folder = "table-folder"
        %>
        <tr class="${folder} table-depth-${depth} ${expanded} pstree-${node.pid}"
          data-dblclick-delegate="{'dblclick_loads':'.sub'}"
          data-partial-line-id="pstree-line-${node.pid}">
          <td style="max-width:400px">
            % if path in open_paths:
              <a href="${remove(path)}" class="jframe-hidden">collapse</a>
            % elif node.children:
              <a href="${add(path)}" class="jframe-hidden">expand</a>
            % endif

            % if node.children:
              <a href="${join_path(request_path, 'subtree=' + str(node.pid) + '&depth=' + str(int(depth)+1))}" class="expand"
                data-spinner-target=".pstree-${node.pid}"
                data-livepath-toggle="${urllib.urlencode([('paths', node.path)])}"
                data-ajax-after=".pstree-${node.pid}" data-ajax-filter="tbody tr">subset</a>
              <a href="${join_path(request_path, 'subtree=' + str(node.pid))}" class="sub jframe-hidden">browse</a>
            % endif

            <div style="overflow:hidden; white-space:nowrap;" data-filters="FitText">${node.command}</div></td>
          <td>${node.pid}</td>
          <td>${node.user}</td>
          <td data-partial-id="pstree-cputime-${node.pid}">${node.cputime}</td>
        </tr>
        % if path in open_paths or show_all:
          % for child in node.children:
            ${create_row(child, depth+1, path+"/"+str(child.pid))}
          % endfor
        % endif
      </%def>

      <thead>
        <tr>
          <th>command</th>
          <th>pid</th>
          <th>user</th>
          <th>cputime</th>
        </tr>
      </thead>
      <tbody data-partial-container-id="pstree-body">
        % for top in tops:
         ${create_row(top, depth, "/" + str(top.pid))}
        % endfor
      </tbody>
      </table>
    </div>
  </body>
</html>
