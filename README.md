# AD7193
*The AD7193 is a low noise, complete analog front end for high precision measurement applications. It contains a low noise, 24-bit sigma-delta (Σ-Δ) analog-to-digital converter (ADC). The on-chip low noise gain stage means that signals of small amplitude can interface directly to the ADC.* -https://www.analog.com/media/en/technical-documentation/data-sheets/AD7193.pdf

`sudo find / -name ad71*` --> `/lib/modules/<ver>/kernel/driver/staging/iio/adc/ad7192.ko.xz`<br>
*The Linux Staging tree (or just "staging" from now on) is used to hold stand-alone[1] drivers and filesystems that are not ready to be merged into the main portion of the Linux kernel tree at this point in time for various technical reasons.* -https://lwn.net/Articles/324279/ <br>

**TODO: Porting from ad7192.c to ad7193.c**
**Is the choosen AD7193 optimal for this project? I don't know. It turns out that I already have it**
