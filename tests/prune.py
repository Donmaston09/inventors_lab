import re,subprocess,json,glob
out=subprocess.run(["node","tests/content.test.js","titles"],capture_output=True,text=True).stdout
bad=set(re.findall(r"✗ (v\d+-\d+) ",out))
tmap=json.loads(re.search(r"TITLES (.*)",out).group(1))
dead={tmap[i] for i in bad}
n=0
for p in glob.glob("js/missions/v*.js"):
    keep=[]
    for l in open(p).read().split("\n"):
        m=re.match(r'\["(.*?)", "',l)
        if m and m.group(1) in dead: n+=1; continue
        keep.append(l)
    open(p,"w").write("\n".join(keep))
print("removed",n)
