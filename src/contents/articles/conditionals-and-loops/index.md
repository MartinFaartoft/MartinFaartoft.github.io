---
title: Conditionals and Loops
author: martin-faartoft
date: 2013-10-21
template: article.jade
---

In which we look at flow control structures in Eiffel.

<span class="more"></span>

## Conditionals ##

_if_ statements look and act just like you would expect

	if [some condition] then
		[statement]
	elseif
		[statement]
    else
    	[statement]
	end

The _elseif_ and _else_ can be omitted

_switch_ 

	inspect val
		when [val1] then [statement]
		when [val2, val3] then [statement] --Eiffel allows multiple values to trigger a single case
		else
			[default statement] --no matching 'when' value found
		end

## Loops ##
Eiffel has two looping constructs, the _across_ loop and the _from-until_ loop.

### Across ###
The _across_ loop is a recent addition to the language, and provides a compact construct for iterating over a collection. The semantics of _across_ is the same as the _foreach_ loops known from both java and C#

example:

	across collection as cursor loop 
		print (cursor.item) 
	end

### From-until ###
The _from-until_ loop is the swiss army knife of Eiffel loops (and until recently the only Eiffel loop).
It takes up a lot of vertical screen space, but works just like you would expect.

	from
		i := 0 --initialize
	until
		i = 10 --when do we stop looping?
	loop
		print(i) --do something with i
		i := i + 1 --increment i
	end

or, looping over a collection of objects

	from
		collection.start --initialize
	until
		collection.after --stop when our collection pointer points after the last element
	loop
		print(collection.item)
		collection.forth --increment the collection pointer
	end

note that Eiffel has no keywords that interrupt program flow, such as _break_ or _continue_. These can be simulated using boolean expressions and conditionals.

If Eiffel does not include your favorite looping construct, you can bash the from-until loop until it behaves like a

_while_ loop:

	from
		stop := false
	until 
		stop = true
	loop
		--do stuff
	end

_do-while_ loop:

	from
		stop := false
		--do stuff
	until
		stop = true
	loop
		--do stuff again
	end

… you get the idea.


