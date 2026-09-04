/* Real question datasets shipped locally (legitimate for this MVP). */

export const APTITUDE_QUESTIONS = [
  // Quantitative
  { id: 1, cat: 'quant', diff: 'Easy', q: 'A train 240 m long crosses a pole in 12 seconds. What is its speed in km/h?', options: ['60 km/h', '72 km/h', '80 km/h', '66 km/h'], answer: 1, expl: 'Speed = 240/12 = 20 m/s = 20 × 3.6 = 72 km/h.' },
  { id: 2, cat: 'quant', diff: 'Easy', q: 'If 40% of a number is 120, what is 75% of the number?', options: ['200', '225', '240', '210'], answer: 1, expl: 'Number = 120/0.4 = 300. 75% of 300 = 225.' },
  { id: 3, cat: 'quant', diff: 'Medium', q: 'The average of 5 numbers is 27. If one number is excluded, the average becomes 25. The excluded number is?', options: ['27', '35', '30', '25'], answer: 1, expl: 'Total = 135. After exclusion total = 100. Excluded = 135 − 100 = 35.' },
  { id: 4, cat: 'quant', diff: 'Medium', q: 'A shopkeeper marks goods 40% above cost price and gives a 10% discount. His profit % is?', options: ['30%', '26%', '24%', '28%'], answer: 1, expl: 'SP = 1.4 × 0.9 × CP = 1.26 CP → 26% profit.' },
  { id: 5, cat: 'quant', diff: 'Medium', q: 'A can do a job in 12 days, B in 18 days. Working together, they finish in?', options: ['6.8 days', '7.2 days', '7.5 days', '8 days'], answer: 1, expl: 'Rate = 1/12 + 1/18 = 5/36 → 36/5 = 7.2 days.' },
  { id: 6, cat: 'quant', diff: 'Hard', q: 'The compound interest on ₹10,000 at 10% p.a. for 2 years (annual compounding) exceeds simple interest by?', options: ['₹100', '₹120', '₹90', '₹110'], answer: 0, expl: 'CI = 12100−10000 = 2100, SI = 2000. Difference = ₹100 (= P·r²/100²).' },
  { id: 7, cat: 'quant', diff: 'Hard', q: 'In how many different ways can the letters of "LEVEL" be arranged?', options: ['30', '60', '120', '20'], answer: 0, expl: '5!/ (2!·2!) = 120/4 = 30 (L and E repeat).' },
  // Logical
  { id: 8, cat: 'logical', diff: 'Easy', q: 'Find the next term: 3, 6, 11, 18, 27, ?', options: ['36', '38', '40', '35'], answer: 1, expl: 'Differences: 3, 5, 7, 9, 11 → 27 + 11 = 38.' },
  { id: 9, cat: 'logical', diff: 'Easy', q: 'Pointing to a photo, Ravi says "She is the daughter of my grandfather\'s only son." How is she related to Ravi?', options: ['Mother', 'Sister', 'Aunt', 'Cousin'], answer: 1, expl: 'Grandfather\'s only son = Ravi\'s father. His daughter = Ravi\'s sister.' },
  { id: 10, cat: 'logical', diff: 'Medium', q: 'If in a code, CAT = 3120, then DOG = ?', options: ['4157', '4156', '4257', '4167'], answer: 0, expl: 'Letters → positions: C=3, A=1, T=20 → 3120. D=4, O=15, G=7 → 4157.' },
  { id: 11, cat: 'logical', diff: 'Medium', q: 'All pens are books. Some books are chairs. Conclusion: (1) Some pens are chairs. (2) Some books are pens.', options: ['Only (1)', 'Only (2)', 'Both', 'Neither'], answer: 1, expl: '(2) follows — all pens are books means some books are pens. (1) does not follow.' },
  { id: 12, cat: 'logical', diff: 'Medium', q: 'A clock shows 3:15. The angle between the hands is?', options: ['0°', '7.5°', '10°', '15°'], answer: 1, expl: 'Minute hand at 90°, hour at 97.5° → 7.5°.' },
  { id: 13, cat: 'logical', diff: 'Hard', q: 'In a row of students, A is 10th from the left and B is 15th from the right. They swap positions and A becomes 18th from the left. Total students?', options: ['30', '32', '33', '31'], answer: 1, expl: 'A\'s new position = B\'s position = 18th from left = 15th from right → total = 18 + 15 − 1 = 32.' },
  { id: 14, cat: 'logical', diff: 'Hard', q: 'Find the wrong number in the series: 2, 6, 15, 31, 56, 93', options: ['31', '15', '56', '93'], answer: 3, expl: 'Differences are perfect squares: +4, +9, +16, +25, +36 → 2, 6, 15, 31, 56, 92. The last term should be 92, so 93 is the wrong number.' },
  // Verbal
  { id: 15, cat: 'verbal', diff: 'Easy', q: 'Choose the word closest in meaning to METICULOUS:', options: ['Careless', 'Thorough', 'Rapid', 'Vague'], answer: 1, expl: 'Meticulous = showing great attention to detail; very thorough.' },
  { id: 16, cat: 'verbal', diff: 'Easy', q: 'Choose the correctly spelt word:', options: ['Occurence', 'Occurrence', 'Ocurrence', 'Occurrance'], answer: 1, expl: 'Correct spelling: occurrence (double c, double r).' },
  { id: 17, cat: 'verbal', diff: 'Medium', q: 'Identify the part with an error: "Neither of the two candidates (A)/ have submitted (B)/ their portfolios (C)/ on time (D)."', options: ['A', 'B', 'C', 'D'], answer: 1, expl: '"Neither" takes a singular verb: "has submitted".' },
  { id: 18, cat: 'verbal', diff: 'Medium', q: 'Choose the best synonym for CANDID:', options: ['Deceptive', 'Frank', 'Timid', 'Hostile'], answer: 1, expl: 'Candid = truthful and straightforward; frank.' },
  // Data interpretation
  { id: 19, cat: 'data', diff: 'Medium', q: 'A company\'s revenue grew from ₹80L in 2023 to ₹92L in 2024. Percentage growth?', options: ['12%', '15%', '13.04%', '14%'], answer: 1, expl: '(92−80)/80 × 100 = 15%.' },
  { id: 20, cat: 'data', diff: 'Medium', q: 'Sales in 4 quarters are ₹40L, ₹55L, ₹45L, ₹60L. The average quarterly sale is?', options: ['₹48L', '₹50L', '₹52L', '₹55L'], answer: 1, expl: '(40+55+45+60)/4 = 200/4 = ₹50L.' },
  { id: 21, cat: 'data', diff: 'Hard', q: 'In a pie chart, Marketing is 20%, R&D 25%, Ops 35%. If Ops is ₹70L, total budget is?', options: ['₹180L', '₹200L', '₹210L', '₹240L'], answer: 1, expl: '35% = ₹70L → 100% = ₹200L.' },
  // Operating Systems
  { id: 22, cat: 'os', diff: 'Easy', q: 'Which scheduling algorithm can cause starvation?', options: ['Round Robin', 'FCFS', 'Shortest Job First', 'None of these'], answer: 2, expl: 'SJF favors short jobs; long processes may starve.' },
  { id: 23, cat: 'os', diff: 'Medium', q: 'A deadlock requires all of these conditions EXCEPT:', options: ['Mutual exclusion', 'Hold and wait', 'Preemption', 'Circular wait'], answer: 2, expl: 'Deadlock needs NO preemption. Preemption actually breaks deadlocks.' },
  { id: 24, cat: 'os', diff: 'Medium', q: 'Thrashing occurs when:', options: ['CPU is idle', 'System spends more time paging than executing', 'Cache overflows', 'Deadlock happens'], answer: 1, expl: 'Thrashing = excessive page faults; the system spends more time swapping pages than running processes.' },
  // DBMS & SQL
  { id: 25, cat: 'dbms', diff: 'Easy', q: 'Which SQL clause filters rows AFTER aggregation?', options: ['WHERE', 'GROUP BY', 'HAVING', 'ORDER BY'], answer: 2, expl: 'HAVING filters grouped results; WHERE filters rows before grouping.' },
  { id: 26, cat: 'dbms', diff: 'Medium', q: 'A relation is in 2NF when it is in 1NF and:', options: ['Has no transitive dependency', 'Every non-key attribute depends on the whole primary key', 'Has no multivalued dependency', 'All attributes are keys'], answer: 1, expl: '2NF = 1NF + no partial dependency on part of a composite key.' },
  { id: 27, cat: 'dbms', diff: 'Medium', q: 'Which property in ACID guarantees a transaction is all-or-nothing?', options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], answer: 0, expl: 'Atomicity: the transaction fully completes or fully rolls back.' },
  // Computer Networks
  { id: 28, cat: 'cn', diff: 'Easy', q: 'Which layer of the OSI model handles routing?', options: ['Data Link', 'Transport', 'Network', 'Session'], answer: 2, expl: 'Layer 3 (Network) routes packets — think IP and routers.' },
  { id: 29, cat: 'cn', diff: 'Medium', q: 'TCP ensures reliable delivery using:', options: ['Checksums only', 'Sequence numbers + ACKs + retransmission', 'Broadcasting', 'UDP tunnels'], answer: 1, expl: 'Reliability comes from sequencing, acknowledgements and retransmission of lost segments.' },
  { id: 30, cat: 'cn', diff: 'Medium', q: 'HTTPS secures HTTP using:', options: ['SSH', 'TLS/SSL encryption', 'VPN', 'IPSec only'], answer: 1, expl: 'HTTPS = HTTP over TLS (formerly SSL), providing encryption and authentication.' },
  // OOP
  { id: 31, cat: 'oop', diff: 'Easy', q: 'Wrapping data and methods together and hiding internal state is called:', options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'], answer: 2, expl: 'Encapsulation bundles data with methods and restricts direct access to state.' },
  { id: 32, cat: 'oop', diff: 'Medium', q: 'Compile-time polymorphism in Java/C++ is achieved via:', options: ['Method overriding', 'Method overloading', 'Virtual functions', 'Interfaces'], answer: 1, expl: 'Overloading resolves at compile time; overriding (virtual) at runtime.' },
  { id: 33, cat: 'oop', diff: 'Medium', q: 'Which relationship is strongest? A Car _____ an Engine.', options: ['inherits', 'aggregates', 'composes (composition)', 'implements'], answer: 2, expl: 'Composition: the engine\'s lifecycle is tied to the car — strongest "has-a".' },
];

/* ---------------- Coding Arena problems ---------------- */
export const CODING_PROBLEMS = [
  {
    id: 'two-sum', title: 'Two Sum', diff: 'Easy', tags: ['Arrays', 'Hash Map'],
    fnName: 'twoSum', sig: 'twoSum(nums, target)',
    statement: 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to `target`. Each input has exactly one solution; you may not use the same element twice.',
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Exactly one valid answer exists'],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', note: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    starter: {
      javascript: 'function twoSum(nums, target) {\n  // your code here\n}\n',
      python: 'def twoSum(nums, target):\n    # your code here\n    pass\n',
      java: 'class Solution {\n  public static int[] twoSum(int[] nums, int target) {\n    // your code here\n    return new int[]{};\n  }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\nvector<int> twoSum(vector<int>& nums, int target) {\n  // your code here\n}\n',
      c: 'int* twoSum(int* nums, int numsSize, int target) {\n  // your code here\n}\n',
    },
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] },
      { args: [[-1, -2, 3, 4], 2], expected: [1, 3] },
    ],
    hints: ['Brute force is O(n²). Can a hash map get you to O(n)?', 'For each number x, check if target − x was already seen.'],
    complexity: { time: 'O(n) with a hash map', space: 'O(n)' },
  },
  {
    id: 'max-subarray', title: 'Maximum Subarray', diff: 'Medium', tags: ['Arrays', 'Dynamic Programming', "Kadane's"],
    fnName: 'maxSubArray', sig: 'maxSubArray(nums)',
    statement: 'Given an integer array `nums`, find the contiguous subarray with the largest sum and return its sum.',
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', note: 'Subarray [4,-1,2,1]' },
      { input: 'nums = [1]', output: '1' },
    ],
    starter: {
      javascript: 'function maxSubArray(nums) {\n  // your code here\n}\n',
      python: 'def maxSubArray(nums):\n    # your code here\n    pass\n',
      java: 'class Solution {\n  public static int maxSubArray(int[] nums) {\n    // your code here\n    return 0;\n  }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\nint maxSubArray(vector<int>& nums) {\n  // your code here\n}\n',
      c: 'int maxSubArray(int* nums, int numsSize) {\n  // your code here\n}\n',
    },
    tests: [
      { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { args: [[1]], expected: 1 },
      { args: [[5, 4, -1, 7, 8]], expected: 23 },
      { args: [[-3, -1, -2]], expected: -1 },
    ],
    hints: ["When the running sum becomes negative, it can never help future subarrays — reset it.", 'Kadane\'s algorithm tracks bestEndingHere and bestOverall in one pass.'],
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
  {
    id: 'valid-palindrome', title: 'Valid Palindrome', diff: 'Easy', tags: ['Strings', 'Two Pointers'],
    fnName: 'isPalindrome', sig: 'isPalindrome(s)',
    statement: 'A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forwards and backwards. Return `true` if `s` is a palindrome.',
    constraints: ['1 ≤ s.length ≤ 2×10⁵', 's contains printable ASCII characters'],
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
      { input: 's = "race a car"', output: 'false' },
    ],
    starter: {
      javascript: 'function isPalindrome(s) {\n  // your code here\n}\n',
      python: 'def isPalindrome(s):\n    # your code here\n    pass\n',
      java: 'class Solution {\n  public static boolean isPalindrome(String s) {\n    // your code here\n    return false;\n  }\n}\n',
      cpp: '#include <string>\nusing namespace std;\nbool isPalindrome(string s) {\n  // your code here\n}\n',
      c: '#include <stdbool.h>\nbool isPalindrome(char* s) {\n  // your code here\n}\n',
    },
    tests: [
      { args: ['A man, a plan, a canal: Panama'], expected: true },
      { args: ['race a car'], expected: false },
      { args: [' '], expected: true },
      { args: ['0P'], expected: false },
    ],
    hints: ['Use two pointers from both ends.', 'Skip non-alphanumeric characters instead of building a new string.'],
    complexity: { time: 'O(n)', space: 'O(1) with two pointers' },
  },
  {
    id: 'valid-parentheses', title: 'Valid Parentheses', diff: 'Easy', tags: ['Stack', 'Strings'],
    fnName: 'isValid', sig: 'isValid(s)',
    statement: 'Given a string `s` containing only the characters `( ) { } [ ]`, return `true` if every opening bracket is closed by the same type in the correct order.',
    constraints: ['1 ≤ s.length ≤ 10⁴', 's consists of parentheses only'],
    examples: [
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    starter: {
      javascript: 'function isValid(s) {\n  // your code here\n}\n',
      python: 'def isValid(s):\n    # your code here\n    pass\n',
      java: 'class Solution {\n  public static boolean isValid(String s) {\n    // your code here\n    return false;\n  }\n}\n',
      cpp: '#include <string>\nusing namespace std;\nbool isValid(string s) {\n  // your code here\n}\n',
      c: '#include <stdbool.h>\nbool isValid(char* s) {\n  // your code here\n}\n',
    },
    tests: [
      { args: ['()'], expected: true },
      { args: ['()[]{}'], expected: true },
      { args: ['(]'], expected: false },
      { args: ['([)]'], expected: false },
      { args: ['{[]}'], expected: true },
    ],
    hints: ['A stack mirrors the required closing order.', 'Push the expected closing bracket; on a closing char, pop and compare.'],
    complexity: { time: 'O(n)', space: 'O(n)' },
  },
  {
    id: 'move-zeroes', title: 'Move Zeroes', diff: 'Easy', tags: ['Arrays', 'Two Pointers'],
    fnName: 'moveZeroes', sig: 'moveZeroes(nums)',
    statement: 'Given an integer array `nums`, move all zeroes to the end while maintaining the relative order of non-zero elements. Return the modified array (in-place style).',
    constraints: ['1 ≤ nums.length ≤ 10⁴', 'Minimize the total number of operations'],
    examples: [
      { input: 'nums = [0,1,0,3,12]', output: '[1,3,12,0,0]' },
      { input: 'nums = [0]', output: '[0]' },
    ],
    starter: {
      javascript: 'function moveZeroes(nums) {\n  // return the array with zeroes moved to the end\n}\n',
      python: 'def moveZeroes(nums):\n    # return the array with zeroes moved to the end\n    pass\n',
      java: 'class Solution {\n  public static int[] moveZeroes(int[] nums) {\n    // return the array with zeroes moved to the end\n    return new int[]{};\n  }\n}\n',
      cpp: '#include <vector>\nusing namespace std;\nvector<int> moveZeroes(vector<int> nums) {\n  // your code here\n}\n',
      c: 'void moveZeroes(int* nums, int numsSize) {\n  // your code here\n}\n',
    },
    tests: [
      { args: [[0, 1, 0, 3, 12]], expected: [1, 3, 12, 0, 0] },
      { args: [[0]], expected: [0] },
      { args: [[1, 0, 1]], expected: [1, 1, 0] },
      { args: [[4, 2, 4]], expected: [4, 2, 4] },
    ],
    hints: ['Track the position where the next non-zero should go.', 'Write all non-zeroes left, then fill the remainder with 0.'],
    complexity: { time: 'O(n)', space: 'O(1) extra' },
  },
  {
    id: 'reverse-string', title: 'Reverse String', diff: 'Easy', tags: ['Strings', 'Two Pointers'],
    fnName: 'reverseString', sig: 'reverseString(s)',
    statement: 'Write a function that reverses a string given as an array of characters, and return the reversed array.',
    constraints: ['1 ≤ s.length ≤ 10⁵', 'Do it with O(1) extra memory'],
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
    ],
    starter: {
      javascript: 'function reverseString(s) {\n  // return the reversed character array\n}\n',
      python: 'def reverseString(s):\n    # return the reversed list\n    pass\n',
      java: 'class Solution {\n  public static String reverseString(String s) {\n    // return the reversed string\n    return "";\n  }\n}\n',
      cpp: '#include <string>\nusing namespace std;\nstring reverseString(string s) {\n  // your code here\n}\n',
      c: 'void reverseString(char* s, int sSize) {\n  // your code here\n}\n',
    },
    tests: [
      { args: [['h', 'e', 'l', 'l', 'o']], expected: ['o', 'l', 'l', 'e', 'h'] },
      { args: [['H', 'a', 'n', 'n', 'a', 'h']], expected: ['h', 'a', 'n', 'n', 'a', 'H'] },
      { args: [['a']], expected: ['a'] },
    ],
    hints: ['Swap s[left] and s[right] while left < right.'],
    complexity: { time: 'O(n)', space: 'O(1)' },
  },
];

/* Java uses String for reverseString starter; keep the test arg as a plain string for Java-ish clarity. */
export const JAVA_COMPAT = { 'reverse-string': 'string-arg' };
