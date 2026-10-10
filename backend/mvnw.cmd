@echo off
set MVN_EXEC="C:\Users\gkann\.m2\wrapper\dists\apache-maven-3.9.16-bin\5grr65jo27hi51sujmtcldfovl\apache-maven-3.9.16\bin\mvn.cmd"
if exist %MVN_EXEC% (
    %MVN_EXEC% %*
) else (
    mvn %*
)
