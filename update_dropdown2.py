import time

# Wait a moment
time.sleep(0.5)

# Read the current file
with open('src/components/layout/UserProfileDropdown.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the button onClick to call item.onClick if it exists
content = content.replace(
    """              <button
                  key={index}
                  style={{
                    width: '100%',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: item.color,
                    borderRadius: '8px',
                    transition: 'background 150ms ease'
                  }}
                  onMouseEnter={(e) => {
                    if (item.label === 'Log Out') {
                      e.currentTarget.style.background = '#FEF2F2';
                    } else {
                      e.currentTarget.style.background = '#F9FAFB';
                    }
                  }}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >""",
    """              <button
                  key={index}
                  onClick={() => item.onClick && item.onClick()}
                  style={{
                    width: '100%',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: item.color,
                    borderRadius: '8px',
                    transition: 'background 150ms ease'
                  }}
                  onMouseEnter={(e) => {
                    if (item.label === 'Log Out') {
                      e.currentTarget.style.background = '#FEF2F2';
                    } else {
                      e.currentTarget.style.background = '#F9FAFB';
                    }
                  }}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >"""
)

# Write back
with open('src/components/layout/UserProfileDropdown.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated UserProfileDropdown.tsx button onClick!")
