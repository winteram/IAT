# Set the path to the IAT folder here (be sure to include trailing slash)
# on Linux (use a single forward slash):
base.dir = "~/Documents/Research/IAT/"
# on Windows (use double forward slashes):
# base.dir = "C://Users//winteram//Documents//IAT//"

# File delimiter = '/' for Unix/Max, '//' for Windows
fd = '/'

# Set the template you want to analyze here
template.name = "Science"
output.dir = paste(base.dir,"templates",fd,template.name,fd,"output",fd,sep="")

setwd(output.dir)
output.files = list.files()
data.list = lapply(output.files, read.table, sep = ",")
summarized <- data.frame(matrix(ncol=9,nrow=length(data.list)))
names(summarized) <- c("Id","Date","Block4.m","Block4.sd","Block7.m","Block7.sd","diff","full.sd",'d')

for(i in 1:length(data.list))
{
  filename = strsplit(output.files[i],'-')
  id = filename[[1]][2]
  iat.date = paste(filename[[1]][4],"-",filename[[1]][5],"-",filename[[1]][3]," ",filename[[1]][6],":",substr(filename[[1]][7],1,2),sep="")
  block4.m = mean(as.numeric(unlist(subset(data.list[[i]], V1==3 & V6>300 & V6 < 3000, select="V6"))))
  block7.m = mean(as.numeric(unlist(subset(data.list[[i]], V1==6 & V6>300 & V6 < 3000, select="V6"))))
  block4.sd = sd(as.numeric(unlist(subset(data.list[[i]], V1==3 & V6>300 & V6 < 3000, select="V6"))))
  block7.sd = sd(as.numeric(unlist(subset(data.list[[i]], V1==6 & V6>300 & V6 < 3000, select="V6"))))
  full.sd = sd(as.numeric(unlist(subset(data.list[[i]], (V1==6 | V1==3) & V6>300 & V6 < 3000, select="V6"))))
  diff = block7.m - block4.m
  d = diff / full.sd
  summarized[i,] = c(id, iat.date, block4.m, block4.sd, block7.m, block7.sd, diff, full.sd, d)
}
rm(block4.m,block4.sd,block7.m,block7.sd,d,data.list,diff,filename,full.sd,i,iat.date,id,output.files)

setwd(paste(base.dir,"templates",fd,template.name,sep=""))
write.csv(summarized, "summarized.csv")
