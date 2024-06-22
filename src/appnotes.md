# todo

future: threlte visualiser?

<!-- todo -->

## colour

- (check in draw function for canvas bg and stroke colours)
- all backgrounds are black
- set global color variable in js. $state()
- set hue and vibe variables, sliders

## effects

- add mainChannelSettings object?
- choose effects
- add effects
- set parameters
- create controls

### per sample

- pitch. three choices - original, up a fifth, down a third?
- add values to the Sample class, as with volume

## active sample settings

- three volume options (-3, -6, -12?)

## samples

- create samples
- load samples

## componentise??

<Header />
    <AppSettings />
<Display />
    <SampleSettings />
    <MainSettings />
    <Visualisation />
<Sequencer />
    <Steps />
    <Transport />
<Samples />
    <Pack />

<!-- and each one has a -->
<LeftButton />
<RightButton />

## issues

grids and mojis don't behave well when zoomed – use rem for tile size?
