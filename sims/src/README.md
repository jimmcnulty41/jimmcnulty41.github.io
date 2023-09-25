# adding another three addon

copy it from node modules
change its three reference to point to the right place
move the d.ts from the vendor/types directory to the vendor dir

# adding a new sim

copy and rename simbase.html in sims/src
copy and update simbase.ts
update the build/simbase.js reference in the html

# Framework note

We don't do components correctly currently.
The model declaration based on entities is nice for
initialization/manual authorship, but misses the point
somewhat. We can keep the Model type as-is but would
benefit from a World that can start with the Model, then
manage the components how it wants.