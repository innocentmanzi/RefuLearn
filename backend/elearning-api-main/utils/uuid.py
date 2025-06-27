import random


def generate_short_numeric_uuid():
    """
    Generate a unique numeric ID between 8 and 10 digits.
    """
    return random.randint(10**7, 10**10 - 1)
