-- Insert sample coding problems
INSERT INTO public.coding_problems (title, description, difficulty, language, starter_code, solution, test_cases) VALUES
(
  'Two Sum',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  'easy',
  'javascript',
  'function twoSum(nums, target) {
    // Your code here
}',
  'function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}',
  '[
    {"input": {"nums": [2,7,11,15], "target": 9}, "output": [0,1]},
    {"input": {"nums": [3,2,4], "target": 6}, "output": [1,2]},
    {"input": {"nums": [3,3], "target": 6}, "output": [0,1]}
  ]'::jsonb
),
(
  'Reverse String',
  'Write a function that reverses a string. The input string is given as an array of characters s.',
  'easy',
  'javascript',
  'function reverseString(s) {
    // Your code here
}',
  'function reverseString(s) {
    let left = 0;
    let right = s.length - 1;
    while (left < right) {
        [s[left], s[right]] = [s[right], s[left]];
        left++;
        right--;
    }
}',
  '[
    {"input": {"s": ["h","e","l","l","o"]}, "output": ["o","l","l","e","h"]},
    {"input": {"s": ["H","a","n","n","a","h"]}, "output": ["h","a","n","n","a","H"]}
  ]'::jsonb
);
