[Originally written in response to this](https://www.reddit.com/r/C_Programming/comments/a4tz2k/very_new_programmer_looking_for_review_of_code/).

----

I feel like you need an example of building this being done well, but that to do so in a different language will give you an opportunity to redo it well yourself.

Therefore, I'm writing Javascript in a C group.  `lol`

I want to give you a heads up: your teacher is probably trying to trip you up with numbers they don't realize are 15 years old.  52 radix at five digits is 380 million entries and change.

These days, amusingly, that's reasonable in a web browser.

That was probably a deal-breaker when the book was written.  They probably want you to not actually keep the list, and just seek out to the right position (or use math to figure it out with no seeking.)

Depends on what your homework actually is.

Anyway.

[Here's an implementation in Javascript](https://stonecypher.github.io/explanations/RadixCounting/counting.html).  Let's go over how it was done together, so that you can do the same thing in C.

----

The key understanding here is that treating the various lengths as different, rather than handling it once flexibly and re-using that, is a mistake.  That massively inflates the work with the same thing repeatedly.

----

Think about this algorithmically instead.  What are you actually doing?

You're just covering a space of counters.  That's pretty much just a number, and you're pretty much just counting.

So let's use the US counting algorithm.

So to treat this like a number, not a string, we observe that 1234 is a number: it's four digits on the implied radix "0123456789".  0x1234 is four digits on the implied radix "0123456789abcdef".

So fuck it.  Your passwords are a number too, on the radix ... whatever your password character set is.

***Now*** you can just count them upwards.

Counting by hand is annoying, but easy when you remember how.  Presuming the US english method of writing integers without separators, presuming four digit decimal, but using full zero fill, you start with `0000`, then you go to the leastmost, and you increment it by one.  If the leastmost is now over 9, you reset it to zero, and increment the second leastmost.  You continue inwards until you hit a not-ten, meaning you've finished this increment, or you run out of digits after the fourth counter, meaning you've run the whole range.

Now rewrite that without the decimal and four digit assumptions.

Starting with `least-counter`, `increment`.  If `counter-overflow`, `next-counter`.  If `out-of-counters`, `range-complete`.  Else `increment-complete`.

Which isn't so bad.

----

So next we think about this architecturally.

How do we want to do this, ish?

For one counting range, it's

* To do `one range`:
    * With counter:
        * Record current state in log
        * Increment to next counter
        * If next-counter-too-high
            * Done
        * Else
            * Continue counting

Thus for your five, it's just

* Concatenate `[ one range(N) || N <- [1..5] ]` (lol erlang too I guess)

----

Fine.  That encloses most of the gross into `increment to next counter`.

How do we actually do that?  Counting is hard.

Well, we think functionally.  (Note that this does the digits in the reverse of the order you'd expect from reading English, since index 0 as least is natural, but index 0 is usually written at the left.)

    /********
     * Get the next counter from the previous
     * next_counter( [3,2,1], 4 ) -> [0,3,1]
     */

    function next_counter(counter, digit_cap) {

      const counterLength = counter.length,            // we use this a lot so cache it
            iCounter      = new Array(counterLength);  // the new counter

      let   bumpNext      = true,                      // always bump the first digit
            whichDigit;                                // cursor in digits of number

      // go over all the digits once, least-significant to most-sig
      for (whichDigit = 0; whichDigit < counterLength; ++whichDigit) {

        // if the previous step said bump, or always at first, then increment this digit by one
        iCounter[whichDigit] = counter[whichDigit] + (bumpNext? 1 : 0);

        // if this digit has gone over
        if (iCounter[whichDigit] >= digit_cap) {
          iCounter[whichDigit] = 0;               // reset it
          bumpNext = true;                        // mark to bump next
        } else {                                // otherwise
          bumpNext = false;                       // mark not to bump next
        }

      }

      // if bumpNext is on at the end, the last digit overflowed; return false because no counter remains
      return bumpNext? false : iCounter;

    }

----

How do we use that?

Well that's pretty straightforward.

* Make a list.
* Make the first counter, and put it in the list.
* Keep getting new counters, and putting them in the list, until there aren't any left.
* Transform those to your letters.
* There's your result.

----

Let's do the transform first.

It seems like your radix is all capital letters then all lower case, so, put the relevant letters in a string, and take that character as a string.

    function ch_transform(digit) {
      return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"[digit];
    }

Simple enough.

----

Then, let's turn `next_counter` into `all_counters`, like discussed above.

    function all_counters(length, digit_cap, transformer) {

      const output = [];                                               // make a list

      let counter = new Array(length).fill(0);                         // make the first counter
      output.push(counter);                                            // put it in the list

      while (counter = next_counter(counter, digit_cap)) {             // keep getting new counters
        output.push(counter);                                          // and putting them in the list
      }                                                                // until there aren't any left

      const transform_one_row = row => row.map(transformer).join('');  // if a string transform is offered, use it then join on ''
      return transformer? output.map(transform_one_row) : output;      // transform those to your letters

    }

----

Presented in a little bit of HTML so that it's usable, you get this.

[Alternately, you can just see it on github pages here](https://stonecypher.github.io/explanations/RadixCounting/counting.html).  Probably the smart choice.



    <!doctype html>
    <html><head><script type="text/javascript">



    /********
     * Get the next counter from the previous
     * next_counter( [3,2,1], 4 ) -> [0,3,1]
     */

    function next_counter(counter, digit_cap) {

      const counterLength = counter.length,            // we use this a lot so cache it
            iCounter      = new Array(counterLength);  // the new counter

      let   bumpNext      = true,                      // always bump the first digit
            whichDigit;                                // cursor in digits of number

      // go over all the digits once, least-significant to most-sig
      for (whichDigit = 0; whichDigit < counterLength; ++whichDigit) {

        // if the previous step said bump, or always at first, then increment this digit by one
        iCounter[whichDigit] = counter[whichDigit] + (bumpNext? 1 : 0);

        // if this digit has gone over
        if (iCounter[whichDigit] >= digit_cap) {
          iCounter[whichDigit] = 0;               // reset it
          bumpNext = true;                        // mark to bump next
        } else {                                // otherwise
          bumpNext = false;                       // mark not to bump next
        }

      }

      // if bumpNext is on at the end, the last digit overflowed; return false because no counter remains
      return bumpNext? false : iCounter;

    }



    function all_counters(length, digit_cap, transformer) {

      const output = [];                                               // make a list

      let counter = new Array(length).fill(0);                         // make the first counter
      output.push(counter);                                            // put it in the list

      while (counter = next_counter(counter, digit_cap)) {             // keep getting new counters
        output.push(counter);                                          // and putting them in the list
      }                                                                // until there aren't any left

      const transform_one_row = row => row.map(transformer).join('');  // if a string transform is offered, use it then join on ''
      return transformer? output.map(transform_one_row) : output;      // transform those to your letters

    }




    // It seems like your radix is all capital letters then all lower case, so,
    // put the relevant letters in a string, and take that character as a string.

    function ch_transform(digit, chs) {
      return chs[digit];
    }





    function byId(id) { return document.getElementById(id); }





    function update() {

      const tgt           = byId('tgt');
            tgt.innerHTML = '';

      const chset         = (byId('chset').value) || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            len           = Number(byId('digits').value);

      const ctrs = all_counters(len, chset.length, digit => ch_transform(digit, chset));

      ctrs.map(ctr => {

        let li           = document.createElement('li');
            li.innerHTML = ctr;

        tgt.appendChild(li);

      });

    }





    window.onload = () => update();





    </script></head><body>

      <table>

        <tr>
          <th>Digits</th>
          <td><input type="number" id="digits" min="1" step="1" value="2" onchange="update();" /></td>
        </tr>

        <tr>
          <th>Characters</th>
          <td><input type="text" id="chset" value="ABC" onkeyup="update();" /></td>
        </tr>

      </table>

      <ul id="tgt"></ul>

    </body></html>