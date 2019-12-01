#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <unistd.h>
#include <stdlib.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <string.h>
#include <limits.h>
#include <sys/mman.h>
#include <math.h>
#include <signal.h>

#define BUFFSIZE 4096
#define MAXLINE 4096
#define S_RATE 100

//PAGE_SIZE = sysconf(_SC_PAGE_SIZE)
#define PAGE_SHIFT 12
#define PAGE_SIZE (1 << PAGE_SHIFT)
#define PAGE_MASK (~(PAGE_SIZE-1))

FILE *vin1_fp;
FILE *vin1_2_fp;

//getopt [p.662]

int main(int argc, char **argv) {
	float freq;
	int exit_val = EXIT_FAILURE;
	char buf[MAXLINE];
	char *pEnd;
	int i;
	uint32_t vout0;
	uint32_t vout1;

	vin1_fp = fopen("/sys/bus/iio/devices/iio:device0/in_voltage1_raw","r");
	//vin1-2_fp = fopen("/sys/bus/iio/devices/iio:device0/in_voltage1-voltage2_raw","r");

	while(1 /*|| fgets(buf,MAXLINE,stdin)!=NULL*/){
	        fread(buf,sizeof(char),10,vin1_fp);
		rewind(vin1_fp);
		printf(buf);
		//sleep(1);
	}
 	exit_val = EXIT_SUCCESS;
 	exitF:
	fclose(vin1_fp);
	return exit_val;
}
