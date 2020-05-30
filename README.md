## AD8232
*The AD8232 is an integrated signal conditioning block for ECG and other biopotential measurement applications. It is designed to extract, amplify, and filter small biopotential signals in the presence of noisy conditions, such as those created by motion or remote electrode placement.*<br>
https://www.analog.com/media/en/technical-documentation/data-sheets/AD8232.pdf<br>

## AD7193
*The AD7193 is a low noise, complete analog front end for high precision measurement applications. It contains a low noise, 24-bit sigma-delta (Σ-Δ) analog-to-digital converter (ADC). The on-chip low noise gain stage means that signals of small amplitude can interface directly to the ADC.*<br>
https://www.analog.com/media/en/technical-documentation/data-sheets/AD7193.pdf

`sudo find / -name ad71*` --> `/lib/modules/<ver>/kernel/driver/staging/iio/adc/ad7192.ko.xz`<br>
*The Linux Staging tree (or just "staging" from now on) is used to hold stand-alone[1] drivers and filesystems that are not ready to be merged into the main portion of the Linux kernel tree at this point in time for various technical reasons.* -https://lwn.net/Articles/324279/ <br>

### 50/60 Hz rejection
*There are several ways to do this (outlined on beginning on page 43 of the AD7193 datasheet), but I would recommend setting bits D9-D0 in the Mode Register to a value of 480 (0b0111100000). This will have the deepest rejection ratio (120 dB minimum) as it is using the default sync filter with 0 latency, although the settling time will increase from the default 80 ms to 400 ms, and the output data rate will decrease from the default 12.5 to 2.5 Hz.* -https://reference.digilentinc.com/pmod/pmod/ad5/user_guide
